using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NodeBasedThreading.API.Models;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;

namespace NodeBasedThreading.API.Services
{
    public class DiagramCodeGenerator
    {
        // Max constraints
        private const int MAX_THREADS = 100;
        private const int MAX_BLOCKS_PER_THREAD = 100;
        private const int MAX_SHARED_VARIABLES = 100;

        public string GenerateCodeFromDiagrams(List<ThreadDiagram> diagrams)
        {
            if (diagrams == null || diagrams.Count == 0)
                throw new ArgumentException("No diagrams provided");

            if (diagrams.Count > MAX_THREADS)
                throw new ArgumentException(
                    $"Too many thread diagrams. Maximum allowed: {MAX_THREADS}"
                );

            // Validate each diagram
            foreach (var diagram in diagrams)
            {
                if (diagram.Nodes.Count > MAX_BLOCKS_PER_THREAD)
                    throw new ArgumentException(
                        $"Too many blocks in thread diagram. Maximum allowed: {MAX_BLOCKS_PER_THREAD}"
                    );

                // Check for cycles in the graph
                ValidateNoCyclicDeadlocks(diagram);
            }

            // Compile shared variables across all diagrams
            var sharedVariables = CollectSharedVariables(diagrams);
            if (sharedVariables.Count > MAX_SHARED_VARIABLES)
                throw new ArgumentException(
                    $"Too many shared variables. Maximum allowed: {MAX_SHARED_VARIABLES}"
                );

            // Create the compilation unit
            var compilationUnit = CompilationUnit()
                .AddUsings(
                    UsingDirective(ParseName("System")),
                    UsingDirective(ParseName("System.Collections.Generic")),
                    UsingDirective(ParseName("System.Threading")),
                    UsingDirective(ParseName("System.Threading.Tasks"))
                )
                .AddMembers(
                    NamespaceDeclaration(ParseName("GeneratedThreadProgram"))
                        .AddMembers(
                            ClassDeclaration("Program")
                                .AddModifiers(Token(SyntaxKind.PublicKeyword))
                                .AddMembers(
                                    // Add shared variable fields
                                    GenerateSharedVariableFields(sharedVariables).ToArray()
                                )
                                .AddMembers(
                                    // Add thread methods
                                    GenerateThreadMethods(diagrams).ToArray()
                                )
                                .AddMembers(
                                    // Add Main method
                                    GenerateMainMethod(diagrams)
                                )
                        )
                );

            // Format the syntax tree with proper indentation
            var formattedCode = compilationUnit.NormalizeWhitespace().ToFullString();

            return formattedCode;
        }

        private void ValidateNoCyclicDeadlocks(ThreadDiagram diagram)
        {
            // Implementation of cycle detection in directed graph
            var visited = new HashSet<string>();
            var recursionStack = new HashSet<string>();

            foreach (var block in diagram.Nodes)
            {
                if (IsCyclicUtil(diagram, block.Id, visited, recursionStack))
                    throw new ArgumentException(
                        $"Cyclic dependency detected in diagram that may cause deadlock"
                    );
            }
        }

        private bool IsCyclicUtil(
            ThreadDiagram diagram,
            string blockId,
            HashSet<string> visited,
            HashSet<string> recursionStack
        )
        {
            // If not visited yet
            if (!visited.Contains(blockId))
            {
                // Mark current node as visited and part of recursion stack
                visited.Add(blockId);
                recursionStack.Add(blockId);

                // Find all next blocks
                var currentBlock = diagram.Nodes.FirstOrDefault(b => b.Id == blockId);
                if (currentBlock != null)
                {
                    var nextBlocks = diagram
                        .Edges.Where(c => c.SourceId == blockId)
                        .Select(c => c.TargetId);

                    foreach (var nextId in nextBlocks)
                    {
                        if (
                            !visited.Contains(nextId)
                            && IsCyclicUtil(diagram, nextId, visited, recursionStack)
                        )
                            return true;
                        else if (recursionStack.Contains(nextId))
                            return true;
                    }
                }
            }

            // Remove this vertex from recursion stack
            recursionStack.Remove(blockId);
            return false;
        }

        private HashSet<string> CollectSharedVariables(List<ThreadDiagram> diagrams)
        {
            var sharedVariables = new HashSet<string>();

            foreach (var diagram in diagrams)
            {
                foreach (var block in diagram.Nodes)
                {
                    switch (block.Type)
                    {
                        case BlockType.Assignment:
                            if (block.Data.TryGetValue("leftVariable", out var leftVariable))
                                sharedVariables.Add(leftVariable);
                            if (block.Data.TryGetValue("rightVariable", out var rightVariable))
                                sharedVariables.Add(rightVariable);
                            break;

                        case BlockType.ConstantAssignment:
                            if (block.Data.TryGetValue("variable", out var constVar))
                                sharedVariables.Add(constVar);
                            break;

                        case BlockType.Read:
                            if (block.Data.TryGetValue("variable", out var inputVar))
                                sharedVariables.Add(inputVar);
                            break;

                        case BlockType.Write:
                            if (block.Data.TryGetValue("variable", out var printVar))
                                sharedVariables.Add(printVar);
                            break;

                        case BlockType.Condition:
                            if (block.Data.TryGetValue("variable", out var condVar))
                                sharedVariables.Add(condVar);
                            break;
                    }
                }
            }

            return sharedVariables;
        }

        private IEnumerable<MemberDeclarationSyntax> GenerateSharedVariableFields(
            HashSet<string> sharedVariables
        )
        {
            // Create static int fields for each shared variable
            foreach (var variable in sharedVariables)
            {
                yield return FieldDeclaration(
                        VariableDeclaration(PredefinedType(Token(SyntaxKind.IntKeyword)))
                            .AddVariables(VariableDeclarator(Identifier(variable)))
                    )
                    .AddModifiers(
                        Token(SyntaxKind.PrivateKeyword),
                        Token(SyntaxKind.StaticKeyword)
                    );
            }
        }

        private IEnumerable<MemberDeclarationSyntax> GenerateThreadMethods(
            List<ThreadDiagram> diagrams
        )
        {
            for (int i = 0; i < diagrams.Count; i++)
            {
                var diagram = diagrams[i];

                // Create a method for each thread
                yield return MethodDeclaration(
                        PredefinedType(Token(SyntaxKind.VoidKeyword)),
                        Identifier($"Thread{i + 1}Method")
                    )
                    .AddModifiers(Token(SyntaxKind.PrivateKeyword), Token(SyntaxKind.StaticKeyword))
                    .WithBody(Block(GenerateThreadMethodStatements(diagram).ToArray()));
            }
        }

        private IEnumerable<StatementSyntax> GenerateThreadMethodStatements(ThreadDiagram diagram)
        {
            // Find the start block
            string startBlockId = GetStartBlockId(diagram);
            var visited = new HashSet<string>();

            // Generate code by traversing the diagram in order
            return GenerateLinearCode(diagram, startBlockId, visited);
        }

        private IEnumerable<StatementSyntax> GenerateLinearCode(
            ThreadDiagram diagram,
            string blockId,
            HashSet<string> visited
        )
        {
            // Prevent infinite recursion
            if (visited.Contains(blockId))
                yield break;

            visited.Add(blockId);

            // Find the current block
            var block = diagram.Nodes.FirstOrDefault(b => b.Id == blockId);
            if (block == null)
                yield break;

            // Generate code for the current block
            switch (block.Type)
            {
                case BlockType.Assignment:
                    if (
                        block.Data.TryGetValue("leftVariable", out var leftVariable)
                        && block.Data.TryGetValue("rightVariable", out var value)
                    )
                    {
                        yield return ExpressionStatement(
                            AssignmentExpression(
                                SyntaxKind.SimpleAssignmentExpression,
                                IdentifierName(leftVariable),
                                IdentifierName(value)
                            )
                        );
                    }
                    break;

                case BlockType.ConstantAssignment:
                    if (
                        block.Data.TryGetValue("variable", out var constVar)
                        && block.Data.TryGetValue("constant", out var constant)
                        && int.TryParse(constant, out int constValue)
                    )
                    {
                        yield return ExpressionStatement(
                            AssignmentExpression(
                                SyntaxKind.SimpleAssignmentExpression,
                                IdentifierName(constVar),
                                LiteralExpression(
                                    SyntaxKind.NumericLiteralExpression,
                                    Literal(constValue)
                                )
                            )
                        );
                    }
                    break;

                case BlockType.Read:
                    if (block.Data.TryGetValue("variable", out var inputVar))
                    {
                        yield return ExpressionStatement(
                            InvocationExpression(
                                    MemberAccessExpression(
                                        SyntaxKind.SimpleMemberAccessExpression,
                                        IdentifierName("Console"),
                                        IdentifierName("WriteLine")
                                    )
                                )
                                .AddArgumentListArguments(
                                    Argument(
                                        LiteralExpression(
                                            SyntaxKind.StringLiteralExpression,
                                            Literal($"Enter value for {inputVar}:")
                                        )
                                    )
                                )
                        );

                        yield return ExpressionStatement(
                            AssignmentExpression(
                                SyntaxKind.SimpleAssignmentExpression,
                                IdentifierName(inputVar),
                                InvocationExpression(
                                        MemberAccessExpression(
                                            SyntaxKind.SimpleMemberAccessExpression,
                                            PredefinedType(Token(SyntaxKind.IntKeyword)),
                                            IdentifierName("Parse")
                                        )
                                    )
                                    .AddArgumentListArguments(
                                        Argument(
                                            InvocationExpression(
                                                MemberAccessExpression(
                                                    SyntaxKind.SimpleMemberAccessExpression,
                                                    IdentifierName("Console"),
                                                    IdentifierName("ReadLine")
                                                )
                                            )
                                        )
                                    )
                            )
                        );
                    }
                    break;

                case BlockType.Write:
                    if (block.Data.TryGetValue("variable", out var printVar))
                    {
                        yield return ExpressionStatement(
                            InvocationExpression(
                                    MemberAccessExpression(
                                        SyntaxKind.SimpleMemberAccessExpression,
                                        IdentifierName("Console"),
                                        IdentifierName("WriteLine")
                                    )
                                )
                                .AddArgumentListArguments(Argument(IdentifierName(printVar)))
                        );
                    }
                    break;

                case BlockType.Condition:
                    if (
                        block.Data.TryGetValue("variable", out var condVar)
                        && block.Data.TryGetValue("operator", out var op)
                        && block.Data.TryGetValue("constant", out var condConst)
                        && int.TryParse(condConst, out int condConstValue)
                    )
                    {
                        // Generate the condition
                        ExpressionSyntax condition;
                        SyntaxKind operatorKind = GetOperatorKind(op);
                        condition = BinaryExpression(
                            operatorKind,
                            IdentifierName(condVar),
                            LiteralExpression(
                                SyntaxKind.NumericLiteralExpression,
                                Literal(condConstValue)
                            )
                        );

                        // Find true and false paths
                        var trueConnection = diagram.Edges.FirstOrDefault(c =>
                            c.SourceId == block.Id && c.Type == ConnectionType.True
                        );

                        var falseConnection = diagram.Edges.FirstOrDefault(c =>
                            c.SourceId == block.Id && c.Type == ConnectionType.False
                        );

                        string trueTargetId = trueConnection?.TargetId ?? "end";
                        string falseTargetId = falseConnection?.TargetId ?? "end";

                        var trueVisited = new HashSet<string>(visited);
                        var falseVisited = new HashSet<string>(visited);

                        // Generate if-else statement with nested code blocks
                        yield return IfStatement(
                            condition,
                            Block(GenerateLinearCode(diagram, trueTargetId, trueVisited).ToArray()),
                            ElseClause(
                                Block(
                                    GenerateLinearCode(diagram, falseTargetId, falseVisited)
                                        .ToArray()
                                )
                            )
                        );

                        // Skip normal flow since both branches have been fully generated
                        yield break;
                    }
                    break;

                case BlockType.End:
                    // For end blocks, just return
                    yield break;
            }

            // Find and generate the next block (for non-condition blocks)
            if (block.Type != BlockType.Condition && block.Type != BlockType.End)
            {
                var nextConnection = diagram.Edges.FirstOrDefault(c =>
                    c.SourceId == block.Id && c.Type == ConnectionType.Normal
                );

                if (nextConnection != null)
                {
                    foreach (
                        var statement in GenerateLinearCode(
                            diagram,
                            nextConnection.TargetId,
                            visited
                        )
                    )
                    {
                        yield return statement;
                    }
                }
            }

            static SyntaxKind GetOperatorKind(string op)
            {
                return op switch
                {
                    "==" => SyntaxKind.EqualsExpression,
                    "<" => SyntaxKind.LessThanExpression,
                    ">" => SyntaxKind.GreaterThanExpression,
                    "<=" => SyntaxKind.LessThanOrEqualExpression,
                    ">=" => SyntaxKind.GreaterThanOrEqualExpression,
                    _ => SyntaxKind.EqualsExpression,
                };
            }
        }

        private string GetStartBlockId(ThreadDiagram diagram)
        {
            // Find the start block - the one that has no incoming connections
            var blockIdsWithIncoming = diagram.Edges.Select(c => c.TargetId).ToHashSet();
            return diagram.Nodes.FirstOrDefault(b => !blockIdsWithIncoming.Contains(b.Id))?.Id
                ?? diagram.Nodes.FirstOrDefault()?.Id
                ?? "start";
        }

        private MethodDeclarationSyntax GenerateMainMethod(List<ThreadDiagram> diagrams)
        {
            var statements = new List<StatementSyntax>();

            // Add console message
            statements.Add(
                ExpressionStatement(
                    InvocationExpression(
                            MemberAccessExpression(
                                SyntaxKind.SimpleMemberAccessExpression,
                                IdentifierName("Console"),
                                IdentifierName("WriteLine")
                            )
                        )
                        .AddArgumentListArguments(
                            Argument(
                                LiteralExpression(
                                    SyntaxKind.StringLiteralExpression,
                                    Literal("Starting multi-threaded program...")
                                )
                            )
                        )
                )
            );

            // Create tasks for each thread
            statements.Add(
                LocalDeclarationStatement(
                    VariableDeclaration(
                            GenericName(Identifier("List"))
                                .WithTypeArgumentList(
                                    TypeArgumentList(
                                        SingletonSeparatedList<TypeSyntax>(IdentifierName("Task"))
                                    )
                                )
                        )
                        .AddVariables(
                            VariableDeclarator(Identifier("tasks"))
                                .WithInitializer(
                                    EqualsValueClause(
                                        ObjectCreationExpression(
                                                GenericName(Identifier("List"))
                                                    .WithTypeArgumentList(
                                                        TypeArgumentList(
                                                            SingletonSeparatedList<TypeSyntax>(
                                                                IdentifierName("Task")
                                                            )
                                                        )
                                                    )
                                            )
                                            .WithArgumentList(ArgumentList())
                                    )
                                )
                        )
                )
            );

            // Start each thread
            for (int i = 0; i < diagrams.Count; i++)
            {
                statements.Add(
                    ExpressionStatement(
                        InvocationExpression(
                                MemberAccessExpression(
                                    SyntaxKind.SimpleMemberAccessExpression,
                                    IdentifierName("tasks"),
                                    IdentifierName("Add")
                                )
                            )
                            .AddArgumentListArguments(
                                Argument(
                                    InvocationExpression(
                                            MemberAccessExpression(
                                                SyntaxKind.SimpleMemberAccessExpression,
                                                IdentifierName("Task"),
                                                IdentifierName("Run")
                                            )
                                        )
                                        .AddArgumentListArguments(
                                            Argument(
                                                SimpleLambdaExpression(
                                                    Parameter(Identifier("_")),
                                                    InvocationExpression(
                                                        IdentifierName($"Thread{i + 1}Method")
                                                    )
                                                )
                                            )
                                        )
                                )
                            )
                    )
                );
            }

            // Wait for all threads to complete
            statements.Add(
                ExpressionStatement(
                    AwaitExpression(
                        InvocationExpression(
                                MemberAccessExpression(
                                    SyntaxKind.SimpleMemberAccessExpression,
                                    IdentifierName("Task"),
                                    IdentifierName("WhenAll")
                                )
                            )
                            .AddArgumentListArguments(Argument(IdentifierName("tasks")))
                    )
                )
            );

            // Add final message
            statements.Add(
                ExpressionStatement(
                    InvocationExpression(
                            MemberAccessExpression(
                                SyntaxKind.SimpleMemberAccessExpression,
                                IdentifierName("Console"),
                                IdentifierName("WriteLine")
                            )
                        )
                        .AddArgumentListArguments(
                            Argument(
                                LiteralExpression(
                                    SyntaxKind.StringLiteralExpression,
                                    Literal("All threads completed.")
                                )
                            )
                        )
                )
            );

            // Add console read line to keep window open
            statements.Add(
                ExpressionStatement(
                    InvocationExpression(
                        MemberAccessExpression(
                            SyntaxKind.SimpleMemberAccessExpression,
                            IdentifierName("Console"),
                            IdentifierName("ReadLine")
                        )
                    )
                )
            );

            return MethodDeclaration(IdentifierName("Task"), Identifier("Main"))
                .AddModifiers(
                    Token(SyntaxKind.PublicKeyword),
                    Token(SyntaxKind.StaticKeyword),
                    Token(SyntaxKind.AsyncKeyword)
                )
                .AddParameterListParameters(
                    Parameter(Identifier("args"))
                        .WithType(
                            ArrayType(PredefinedType(Token(SyntaxKind.StringKeyword)))
                                .WithRankSpecifiers(
                                    SingletonList(
                                        ArrayRankSpecifier()
                                            .WithSizes(
                                                SingletonSeparatedList<ExpressionSyntax>(
                                                    OmittedArraySizeExpression()
                                                )
                                            )
                                    )
                                )
                        )
                )
                .WithBody(Block(statements));
        }
    }
}

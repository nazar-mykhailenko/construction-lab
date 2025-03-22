import { createFileRoute } from '@tanstack/react-router'
import '@xyflow/react/dist/style.css';

export const Route = createFileRoute('/')({
  component: Index,
})

import { Flow } from '../components/Flow';

function Index() {
  return (
    <div className="w-full h-full">
      <Flow />
    </div>
  );
}


'use client';

// A simple component to render the falling leaves animation.
const Leaves = ({ containerClass }: { containerClass: string }) => (
  <div className={containerClass}>
    <div className="leaves">
      {/* Generate 25 leaf elements for the animation */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="leaf"></div>
      ))}
    </div>
  </div>
);

// This component wraps the leaves in a container for use in specific pages.
export default function LeavesEffect({ layer = 'background' }: { layer?: 'background' | 'foreground' }) {
  const containerClass = layer === 'foreground' ? 'leaves-container-foreground' : 'leaves-container';
  return <Leaves containerClass={containerClass} />;
}

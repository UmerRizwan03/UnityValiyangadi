
'use client';

import type { Member } from '@/lib/types';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MemberProfileSheet } from '@/components/MemberProfileSheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { XCircle, ZoomIn, ZoomOut, Expand, ChevronDown, ChevronUp } from 'lucide-react';
import { MemberSearch } from './MemberSearch';
import type { AuthState } from '@/lib/auth';
import { Separator } from './ui/separator';

const MemberNodeCard = ({ member, onNodeClick, isFaded, isHighlighted }: { member: Member; onNodeClick: (member: Member) => void; isFaded?: boolean; isHighlighted?: boolean; }) => {
  const birthYear = member.dateOfBirth ? member.dateOfBirth.substring(0, 4) : 'N/A';
  const deathYear = member.dateOfDeath ? member.dateOfDeath.substring(0, 4) : null;
  
  const lifespan = deathYear
    ? `${birthYear} - ${deathYear}`
    : `Born ${birthYear}`;

  return (
     <div 
        className={cn(
            "relative mx-auto w-64 cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
            "transition-opacity duration-500",
            isFaded && "opacity-20 pointer-events-none",
            isHighlighted && "animate-pulse-once"
        )}
        onClick={() => onNodeClick(member)}
      >
      <div
        className="relative h-24 p-4"
        style={function(e){let t;switch(e){case"Male":t="linear-gradient(to bottom right, #60a5fa, #4f46e5)";break;case"Female":t="linear-gradient(to bottom right, #f472b6, #e11d48)";break;default:t="linear-gradient(to bottom right, #9ca3af, #4b5563)"}return{backgroundImage:`radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0), ${t}`,backgroundSize:"1rem 1rem, 100% 100%"}}(member.gender)}
      >
        <div className="absolute bottom-0 left-1/2 h-20 w-20 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-card bg-card p-1">
          <Image
            src={member.photoUrl}
            alt={`Photo of ${member.name}`}
            width={72}
            height={72}
            className="h-full w-full rounded-full object-cover"
            data-ai-hint="person portrait"
          />
        </div>
      </div>
      <div className="px-4 pt-12 pb-6 text-center">
        <h3 className="font-headline text-xl font-bold">{member.name}</h3>
        <div className="mt-2 space-y-3 text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span>{lifespan}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


interface TreeNodeProps {
  member: Member;
  allMembersById: Map<string, Member>;
  childrenMap: Map<string, Member[]>;
  onNodeClick: (member: Member) => void;
  highlightedAncestorId: string | null;
  descendantIds: Set<string>;
  highlightedNodeId: string | null;
  isInitiallyExpanded?: boolean;
}

// A recursive component to render each node and its children
const TreeNode = ({ 
    member, 
    allMembersById, 
    childrenMap,
    onNodeClick,
    highlightedAncestorId,
    descendantIds,
    highlightedNodeId,
    isInitiallyExpanded = false,
}: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(isInitiallyExpanded);
  
  const isFaded = highlightedAncestorId ? !(descendantIds.has(member.id) || member.id === highlightedAncestorId) : false;

  const children = childrenMap.get(member.id) || [];

  return (
    <li>
      <div className="flex flex-col items-center">
        <MemberNodeCard
            key={member.id}
            member={member}
            onNodeClick={onNodeClick}
            isFaded={isFaded}
            isHighlighted={member.id === highlightedNodeId}
        />
        {children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-[-1px] rounded-b-lg rounded-t-none w-64 bg-card hover:bg-muted"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" /> Show Children ({children.length})
              </>
            )}
          </Button>
        )}
      </div>
      {isExpanded && children.length > 0 && (
        <ul>
          {children.map(child => (
            <TreeNode 
                key={child.id} 
                member={child} 
                allMembersById={allMembersById}
                childrenMap={childrenMap} 
                onNodeClick={onNodeClick}
                highlightedAncestorId={highlightedAncestorId}
                descendantIds={descendantIds}
                highlightedNodeId={highlightedNodeId}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const FamilyTree = ({ members, authState }: { members: Member[]; authState: AuthState }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [highlightedAncestorId, setHighlightedAncestorId] = useState<string | null>(null);
  const [descendantIds, setDescendantIds] = useState<Set<string>>(new Set());
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [scale, setScale] = useState(0.45);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // This effect centers the tree view on initial mount.
  useEffect(() => {
    const centerView = () => {
      if (containerRef.current) {
        const treeContent = containerRef.current.querySelector<HTMLElement>('.tree');
        if (treeContent) {
          const containerWidth = containerRef.current.offsetWidth;
          const treeWidth = treeContent.offsetWidth;
          // Use the default scale for initial calculation
          const initialX = (containerWidth - treeWidth * 0.45) / 2;
          const initialY = 40;
          setPosition({ x: initialX, y: initialY });
        }
      }
    };
    // A small delay ensures the tree has fully rendered and its width is measurable.
    const timeoutId = setTimeout(centerView, 100);
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures this runs only once on mount.

  // This effect handles the cleanup for the node highlight timeout.
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);
  
  const handleNodeClick = (member: Member) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setSelectedMember(member);
    setHighlightedNodeId(member.id);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedNodeId(null);
    }, 2500);
  };
  
  const handleSearchSelect = (member: Member) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedNodeId(member.id);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedNodeId(null);
    }, 2500);
  };

  const handleSheetClose = () => {
    setSelectedMember(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = scale * (1 - e.deltaY * 0.001);
    const clampedScale = Math.max(0.2, Math.min(3, newScale));

    const newX = mouseX - (mouseX - position.x) * (clampedScale / scale);
    const newY = mouseY - (mouseY - position.y) * (clampedScale / scale);

    setScale(clampedScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    setIsPanning(true);
    setStartPanPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    e.stopPropagation();
    setPosition({
      x: e.clientX - startPanPosition.x,
      y: e.clientY - startPanPosition.y,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    e.stopPropagation();
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.2));
  
  const handleReset = () => {
    const targetScale = 0.45;
    setScale(targetScale);
    
    // Re-run centering logic on reset
    if (containerRef.current) {
        const treeContent = containerRef.current.querySelector<HTMLElement>('.tree');
        if (treeContent) {
          const containerWidth = containerRef.current.offsetWidth;
          const treeWidth = treeContent.offsetWidth;
          const newX = (containerWidth - treeWidth * targetScale) / 2;
          const newY = 40;
          setPosition({ x: newX, y: newY });
        }
    } else {
        // Fallback if ref is not available
        setPosition({ x: 0, y: 0 });
    }
  };


  const { rootNodes, membersById, childrenMap } = React.useMemo(() => {
    if (!members || members.length === 0) {
      return { rootNodes: [], membersById: new Map(), childrenMap: new Map() };
    }

    const membersById = new Map(members.map(m => [m.id, m]));
    const childrenMap = new Map<string, Member[]>();
    const hasParents = new Set<string>();

    members.forEach(member => {
        if (member.parents && member.parents.length > 0) {
            hasParents.add(member.id);
            member.parents.forEach(parentId => {
                if (membersById.has(parentId)) {
                    const existingChildren = childrenMap.get(parentId) || [];
                    childrenMap.set(parentId, [...existingChildren, member]);
                }
            });
        }
    });

    const rootNodes: Member[] = members.filter(member => !hasParents.has(member.id));

    return { rootNodes, membersById, childrenMap };
  }, [members]);


  if (!members || members.length === 0) {
    return <p>No members to display in the tree.</p>;
  }

  const handleShowDescendants = (ancestorId: string) => {
    const ancestor = members.find(m => m.id === ancestorId);
    if (!ancestor) return;

    const descendants = new Set<string>();
    const queue: Member[] = [];
    const visitedIds = new Set<string>();
    
    const childrenOfAncestor = childrenMap.get(ancestorId) || [];
childrenOfAncestor.forEach((child: Member) => {
  if (!visitedIds.has(child.id)) {
    queue.push(child);
    visitedIds.add(child.id);
    descendants.add(child.id);
  }
});


    let head = 0;
    while(head < queue.length) {
        const current = queue[head++];
        const children = childrenMap.get(current.id) || [];
        children.forEach((child: Member) => {
  if (!visitedIds.has(child.id)) {
    visitedIds.add(child.id);
    descendants.add(child.id);
    queue.push(child);
  }
});

    }

    setHighlightedAncestorId(ancestorId);
    setDescendantIds(descendants);
    setSelectedMember(null); // Close the sheet
  };
  
  const handleResetHighlight = () => {
    setHighlightedAncestorId(null);
    setDescendantIds(new Set());
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-6">
        <MemberSearch members={members} onSelect={handleSearchSelect} />
        {highlightedAncestorId && (
          <div className="text-center">
            <Button variant="outline" onClick={handleResetHighlight}>
              <XCircle className="mr-2 h-4 w-4" />
              Reset Tree View
            </Button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative h-[70vh] w-full cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="tree"
          style={{
            width: 'max-content',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            padding: '2rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <ul>
            {rootNodes.map(rootNode => (
                <TreeNode 
                  key={rootNode.id} 
                  member={rootNode} 
                  allMembersById={membersById}
                  childrenMap={childrenMap} 
                  onNodeClick={handleNodeClick}
                  highlightedAncestorId={highlightedAncestorId}
                  descendantIds={descendantIds}
                  highlightedNodeId={highlightedNodeId}
                  isInitiallyExpanded={true}
                />
            ))}
          </ul>
        </div>
        
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border bg-background/80 p-1 shadow-md backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="w-12 text-center text-sm font-medium tabular-nums">
                {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon" onClick={handleReset}>
                <Expand className="h-5 w-5" />
            </Button>
        </div>
      </div>
      
      <MemberProfileSheet 
        member={selectedMember} 
        allMembers={members}
        isOpen={!!selectedMember}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleSheetClose();
          }
        }}
        onMemberClick={handleNodeClick}
        onShowDescendants={handleShowDescendants}
        authState={authState}
      />
    </>
  );
};

export default FamilyTree;

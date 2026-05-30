import { create } from "zustand";

type MindmapInteractionState = {
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  focusedNodeId: string | null;
  panelOpen: boolean;
  toggleNodeSelection: (nodeId: string) => void;
  setHoveredNodeId: (nodeId: string | null) => void;
  setFocusedNodeId: (nodeId: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  resetSelection: () => void;
};

export const useMindmapStore = create<MindmapInteractionState>((set) => ({
  selectedNodeIds: [],
  hoveredNodeId: null,
  focusedNodeId: null,
  panelOpen: false,
  toggleNodeSelection: (nodeId) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.includes(nodeId)
        ? state.selectedNodeIds.filter((id) => id !== nodeId)
        : [...state.selectedNodeIds, nodeId],
    })),
  setHoveredNodeId: (nodeId) => set({ hoveredNodeId: nodeId }),
  setFocusedNodeId: (nodeId) => set({ focusedNodeId: nodeId, panelOpen: Boolean(nodeId) }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  resetSelection: () => set({ selectedNodeIds: [] }),
}));

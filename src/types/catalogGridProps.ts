import { CatalogProps } from './catalog';

export interface CatalogGridProps {
	categories: CatalogProps[];
	isEditing: boolean;
	draggedCategory: CatalogProps | null;
	hoveredCategoryId: number | null;
	onDragStartAction: (category: CatalogProps) => void;
	onDragOverAction: (e: React.DragEvent, categoryId: number) => void;
	onDragLeaveAction: () => void;
	onDropAction: (e: React.DragEvent, targetCategoryId: number) => void;
}

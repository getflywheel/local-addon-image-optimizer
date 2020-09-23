import React from 'react';
import { ColFileStatus } from './columnRenderers/ColFileStatus';
import { ColFileName } from './columnRenderers/ColFileName';
import { ColFileSize } from './columnRenderers/ColFileSize'
import { Button,
		VirtualTable,
		VirtualTableCellRenderer,
		IVirtualTableCellRendererDataArgs
	} from '@getflywheel/local-components';
import { ImageData } from '../types';

interface IFileListViewProps {
	imageData: ImageData[],
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	getImageDataState: () => void,
	getCompressionList: () => void,
	isCurrentlyOptimizing: boolean,
}

export const FileListView = (props: IFileListViewProps) =>  {
	const cellRender: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		switch (dataArgs.colKey) {
			case 'fileStatus':
				return (
					<ColFileStatus
						dataArgs={dataArgs}
						handleCheckBoxChange={props.handleCheckBoxChange}
						toggleSelectAll={props.toggleSelectAll}
						toggleSelectAllValue={props.toggleSelectAllValue}
						isCurrentlyOptimizing={props.isCurrentlyOptimizing}
					/>
				);
			case 'filePath':
				return (
					<ColFileName
						dataArgs={dataArgs}
					/>
				);
			case 'originalSize':
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			case 'compressedSize':
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			default: return null;
		}
	};

	return(
		<div>
			<div>
				<Button
					onClick={props.getCompressionList}
				>
					Optimize Images
				</Button>

				<Button
					onClick={props.getImageDataState}
				>
					View State
				</Button>
			</div>
			<div>
			<VirtualTable
				cellRenderer={cellRender}
				data={(props.imageData)}
				headers={[
					{ key: 'fileStatus', value: '' },
					{ key: 'filePath', value: 'Filename' },
					{ key: 'originalSize', value: 'Original Size' },
					{ key: 'compressedSize', value: 'Compressed Size' }
				]}
				headersCapitalize='none'
				striped
			/>
			</div>
		</div>
	);
};

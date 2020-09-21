import React from 'react';
import { colFileStatus } from './columnRenderers/colFileStatus';
import { colFileName } from './columnRenderers/colFileName';
import { colFileSize } from './columnRenderers/colFileSize'

// https://github.com/getflywheel/local-components
import { Button,
		VirtualTable,
		VirtualTableCellRenderer,
		IVirtualTableCellRendererDataArgs
	} from '@getflywheel/local-components';

export const FileListView = (props) =>  {
	const cellRender: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		switch (dataArgs.colKey) {
			case 'fileStatus':
				return colFileStatus(
					dataArgs,
					props.handleCheckBoxChange,
					props.toggleSelectAll,
					props.toggleSelectAllValue,
					props.isCurrentlyOptimizing);
			case 'filePath':
				return colFileName(dataArgs);
			case 'originalSize':
				return colFileSize(dataArgs);
			case 'compressedSize':
				return colFileSize(dataArgs);
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
			</div>
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
	);
};

import React, { Component } from 'react';

// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

// https://github.com/getflywheel/local-components
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
	} from '@getflywheel/local-components';

export const colFileStatus = (
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange,
	toggleSelectAll,
	toggleSelectAllValue,
	isCurrentlyOptimizing,
	) =>  {

	const checked = dataArgs.isHeader ? toggleSelectAllValue : dataArgs.rowData.isChecked;
	const onChange = dataArgs.isHeader ? toggleSelectAll : handleCheckBoxChange(dataArgs.rowData.originalImageHash);

	if(!isCurrentlyOptimizing) {
		return(
			<div>
				<Checkbox
					checked={ checked }
					onChange={ onChange }
				/>
			</div>
		);
	} else {
		return(
			<div>
				Optimization started
			</div>
		);
	}
};

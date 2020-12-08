import React from 'react';
import ReactDOM from 'react-dom';
import { FlyModal } from '@getflywheel/local-components';
import { FunctionGeneric } from '@getflywheel/local-components/dist/common/structures/Generics';


export interface BaseModalProps {
	onSubmit?: FunctionGeneric;
}

interface ModalOptions<ModalContentsProps> extends BaseModalProps {
	ModalContents: (props: BaseModalProps & ModalContentsProps) => JSX.Element;
	modalContentsProps?: ModalContentsProps;
}

function invokeModal<ModalContentsProps>(options: ModalOptions<ModalContentsProps>)  {
	const {
		ModalContents,
		onSubmit,
		modalContentsProps,
	} = options;

	ReactDOM.render(
		(
			<FlyModal
				contentLabel='Confirm Optimization'
			>
				<ModalContents
					onSubmit={() => {
						onSubmit?.();
						FlyModal.onRequestClose();
					}}
					{...modalContentsProps}
				/>
			</FlyModal>
		), document.getElementById('popup-container'),
	);
};

export default invokeModal;

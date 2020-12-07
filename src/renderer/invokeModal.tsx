import React from 'react';
import ReactDOM from 'react-dom';
import { FlyModal } from '@getflywheel/local-components';
import { FunctionGeneric } from '@getflywheel/local-components/dist/common/structures/Generics';


export interface BaseModalProps {
	onCancel?: FunctionGeneric;
	onSubmit?: FunctionGeneric;
}

interface ModalProps<ModalContentsProps> extends BaseModalProps {
	ModalContents: (props: BaseModalProps & ModalContentsProps) => JSX.Element;
	modalContentsProps: ModalContentsProps;
}

function invokeModal <ModalContentsProps>(props: ModalProps<ModalContentsProps>)  {
	const {
		ModalContents,
		onCancel,
		onSubmit,
		modalContentsProps,
	} = props;

	// const onSubmit = () => {
	// 	onSubmit?();
	// 	// compressSelectedImages();
	// 	FlyModal.onRequestClose();
	// };

	const onCancelSelect = () => {
		onCancel?.();
		FlyModal.onRequestClose();
	}

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
					onCancel={onCancelSelect}
					{...modalContentsProps}
				/>
			</FlyModal>
		), document.getElementById('popup-container'),
	);
};

export default invokeModal;

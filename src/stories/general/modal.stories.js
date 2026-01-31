import React, { useState } from 'react';
import { Callout } from "@/components/general/callout";
import { Modal, handleModalOpen } from "@/components/general/modal";

export default {
	title: 'General',
	component: Modal,
};

const PageModal = () => {
	const [modalContent, setModalContent] = useState();
	const handleImageClick = (event, url) => {
		const myContent = <img src={url} title="Modal Image" alt="Modal Image" />;
		setModalContent(myContent);
		handleModalOpen(event);
  	};
	return (
		<>
        	<div className="row-4col">
				<div className="grid-item">
					<Callout
						url="https://farm66.static.flickr.com/65535/50797219348_a7f5b18dd5_b.jpg"
						img="https://www.pixelvivid.com/images/customs/black-white-splatter.jpg"
						imgClick={handleImageClick}
						imgShape="squircle"
						imgAlt="Black White Splatter" />
				</div>
			</div>
			<Modal modalContent={modalContent} />
		</>
	);
};

export const ModalPopup = () => <PageModal />;
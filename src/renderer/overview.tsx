import React, { Component } from 'react';

// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

// https://github.com/getflywheel/local-components
import { Button, FlyModal, Title, Text } from '@getflywheel/local-components';

export const Overview = (props) =>  (

	<div>
		Hello World, this is the overview tab
		<Button onClick={()=>props.setOverviewSelected(false)}> File List View </Button>
	</div>
);

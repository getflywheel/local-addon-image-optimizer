import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';


// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

// https://github.com/getflywheel/local-components
import { Button, FlyModal, Title, Text } from '@getflywheel/local-components';

export const ImageOptimizer = () =>  (
				<div>
					<Button >Decrement Count</Button> &nbsp;
					<Button >Increment Count</Button> &nbsp;
					<Button >Randomize Count</Button> &nbsp;
					<Button >Save Count</Button>
				</div>
        );

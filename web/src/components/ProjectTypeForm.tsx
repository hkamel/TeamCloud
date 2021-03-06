// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Stack, TextField, Spinner, DefaultButton, IButtonStyles, getTheme, Image, ButtonType, Text, Label, Checkbox, SpinButton, Panel, PrimaryButton, ComboBox } from '@fluentui/react';
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning';
import { ProjectType, Provider, ProviderReference } from 'teamcloud';
import { AzureRegions } from '../model'
import AppInsights from '../img/appinsights.svg';
import DevOps from '../img/devops.svg';
import DevTestLabs from '../img/devtestlabs.svg';
import GitHub from '../img/github.svg';
import { api } from '../API';

export interface IProjectTypeFormProps {
    panelIsOpen: boolean;
    onFormClose: () => void;
}

export const ProjectTypeForm: React.FunctionComponent<IProjectTypeFormProps> = (props) => {

    const [providers, setProviders] = useState<Provider[]>();
    const [formEnabled, setFormEnabled] = useState<boolean>(true);
    const [projectTypeName, setProjectTypeName] = useState<string>();
    const [projectTypeIsDefault, setProjectTypeIsDefault] = useState<boolean>();
    const [projectTypeRegion, setProjectTypeRegion] = useState<string>();
    const [projectTypeSubscriptions, setProjectTypeSubscriptions] = useState<string[]>();
    const [projectTypeSubscriptionsCapacity, setProjectTypeSubscriptionsCapacity] = useState(10);
    const [projectTypeRgNamePrefix, setProjectTypeRgNamePrefix] = useState<string>();
    const [projectTypeProviders, setProjectTypeProviders] = useState(new Array<ProviderReference>());
    const [errorText, setErrorText] = useState<string>();

    useEffect(() => {
        if (providers === undefined) {
            const _setProviders = async () => {
                const result = await api.getProviders()
                setProviders(result.data);
            };
            _setProviders();
        }
    }, [providers]);

    const _findKnownProviderName = (provider: Provider) => {
        if (provider.id) {
            if (provider.id.startsWith('azure.appinsights')) return 'AppInsights';
            if (provider.id.startsWith('azure.devops')) return 'DevOps';
            if (provider.id.startsWith('azure.devtestlabs')) return 'DevTestLabs';
            if (provider.id.startsWith('github')) return 'GitHub';
        }
        return undefined;
    }

    const _findKnownProviderImage = (provider: Provider) => {
        if (provider.id) {
            if (provider.id.startsWith('azure.appinsights')) return AppInsights;
            if (provider.id.startsWith('azure.devops')) return DevOps;
            if (provider.id.startsWith('azure.devtestlabs')) return DevTestLabs;
            if (provider.id.startsWith('github')) return GitHub;
        }
        return provider.id;
    }

    const theme = getTheme();

    const _providerButtonStyles: IButtonStyles = {
        root: {
            border: 'none',
            height: '100%',
            width: '100%',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: theme.palette.neutralLighter,
            padding: '8px 20px'
        },
        rootHovered: {
            backgroundColor: theme.palette.themeLighter,
        },
        rootPressed: {
            backgroundColor: theme.palette.themeLighter,
        },
        rootChecked: {
            backgroundColor: theme.palette.themeLighter,
            borderColor: theme.palette.themePrimary,
        },
        rootCheckedHovered: {
            backgroundColor: theme.palette.themeLighter,
        }
    }

    const _toggleProviderSelection = (provider: Provider) => {
        const providerReferences = projectTypeProviders.slice()
        let index = providerReferences.findIndex(r => r.id === provider.id)
        if (index > -1) {
            providerReferences.splice(index, 1)
        } else {
            providerReferences.push({ id: provider.id })
        }
        setProjectTypeProviders(providerReferences)
    }

    const _getProviderButtons = (data?: Provider[]) => {
        let buttons = data?.map(p => (
            <Stack.Item key={p.id} styles={{ root: { width: '46%' } }}>
                <DefaultButton
                    toggle
                    checked={projectTypeProviders.findIndex(pr => pr.id === p.id) > -1}
                    buttonType={ButtonType.icon}
                    styles={_providerButtonStyles}
                    onClick={() => _toggleProviderSelection(p)} >
                    <Stack horizontalAlign='center' tokens={{ padding: '10px', childrenGap: '6px' }}>
                        <Image
                            src={_findKnownProviderImage(p)}
                            height={48} width={48} />
                        <Text>{_findKnownProviderName(p)}</Text>
                    </Stack>
                </DefaultButton>
            </Stack.Item >
        ));
        return (
            <Stack horizontal wrap tokens={{ childrenGap: '12px' }}>
                {buttons}
            </Stack>
        );
    }

    const _submitForm = async () => {
        setFormEnabled(false);
        if (projectTypeName && projectTypeRegion && projectTypeProviders.length > 0 && projectTypeSubscriptions && projectTypeSubscriptions.length > 0) {
            const projectType: ProjectType = {
                id: projectTypeName,
                isDefault: projectTypeIsDefault,
                region: projectTypeRegion,
                subscriptions: projectTypeSubscriptions,
                subscriptionCapacity: projectTypeSubscriptionsCapacity,
                resourceGroupNamePrefix: projectTypeRgNamePrefix,
                providers: projectTypeProviders
            };
            const result = await api.createProjectType({ body: projectType });
            if (result.code === 201)
                _resetAndCloseForm();
            else {
                // console.log(JSON.stringify(result));
                setErrorText(result.status);
            }
        }
    };

    const _resetAndCloseForm = () => {
        setProjectTypeName(undefined);
        setProjectTypeIsDefault(undefined)
        setProjectTypeRegion('eastus')
        setProjectTypeSubscriptions(new Array<string>())
        setProjectTypeSubscriptionsCapacity(10)
        setProjectTypeRgNamePrefix(undefined)
        setProjectTypeProviders(new Array<ProviderReference>())
        setErrorText('')
        setFormEnabled(true);
        props.onFormClose();
    };

    const _onRenderPanelFooterContent = () => (
        <div>
            <PrimaryButton text='Create project type' disabled={!formEnabled || !(projectTypeName && projectTypeRegion && projectTypeProviders.length > 0 && projectTypeSubscriptions && projectTypeSubscriptions?.length > 0)} onClick={() => _submitForm()} styles={{ root: { marginRight: 8 } }} />
            <DefaultButton text='Cancel' disabled={!formEnabled} onClick={() => _resetAndCloseForm()} />
            <Spinner styles={{ root: { visibility: formEnabled ? 'hidden' : 'visible' } }} />
        </div>
    );

    const subscriptionRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/g

    return (
        <Panel
            headerText='New Project Type'
            isOpen={props.panelIsOpen}
            onDismiss={() => _resetAndCloseForm()}
            onRenderFooterContent={_onRenderPanelFooterContent}>

            <Stack tokens={{ childrenGap: '12px' }}>
                <Stack.Item>
                    <Label required>Providers</Label>
                    {_getProviderButtons(providers)}
                </Stack.Item>
                <Stack.Item>
                    <TextField
                        label='Name'
                        required
                        // errorMessage='Name is required.'
                        disabled={!formEnabled}
                        onChange={(_ev, val) => setProjectTypeName(val)} />
                </Stack.Item>
                <Stack.Item>
                    <ComboBox
                        label='Region'
                        required
                        allowFreeform
                        autoComplete={'on'}
                        selectedKey={projectTypeRegion}
                        options={AzureRegions.map(r => ({ key: r, text: r }))}
                        onChange={(_ev, val) => setProjectTypeRegion(val?.text ?? undefined)} />
                </Stack.Item>
                <Stack.Item>
                    <TextField
                        label='Subscription IDs'
                        required
                        // errorMessage='Name is required.'
                        // description='Comma-separated list of Azure Subscription IDs'
                        disabled={!formEnabled}
                        validateOnLoad={false}
                        validateOnFocusOut
                        onGetErrorMessage={(val) => val.match(subscriptionRegex) ? '' : 'Must be one or more Azure Subscription IDs.'}
                        onChange={(_ev, val) => setProjectTypeSubscriptions(val?.match(subscriptionRegex) ?? undefined)} />
                </Stack.Item>
                <Stack.Item>
                    <SpinButton
                        label='Subscription capacity'
                        labelPosition={Position.top}
                        defaultValue='10'
                        min={1}
                        max={50}
                        step={1}
                        incrementButtonAriaLabel={'Increase value by 1'}
                        decrementButtonAriaLabel={'Decrease value by 1'} />
                    {/* onChange={(ev, val) => setProjectTypeSubscriptionsCapacity(val)} /> */}
                </Stack.Item>
                <Stack.Item>
                    <TextField
                        label='Resource Group name prefix'
                        // errorMessage='Name is required.'
                        disabled={!formEnabled}
                        onChange={(_ev, val) => setProjectTypeRgNamePrefix(val)} />
                </Stack.Item>
                <Stack.Item>
                    <Checkbox
                        label='Set as default'
                        styles={{ root: { paddingTop: '10px' }, label: { fontSize: '14px', fontWeight: '600' } }}
                        onChange={(_ev, val) => setProjectTypeIsDefault(val)} />
                </Stack.Item>
            </Stack>
            <Text>{errorText}</Text>
        </Panel>
    );
}

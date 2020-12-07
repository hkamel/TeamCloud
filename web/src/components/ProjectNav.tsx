// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Nav, INavLinkGroup, INavLink, Stack, ActionButton, Persona, PersonaSize, Text } from '@fluentui/react';

export const ProjectNav: React.FC = () => {

    const history = useHistory();
    const { orgId, projectId, navId } = useParams() as { orgId: string, projectId: string, navId: string };

    const _navLinkGroups = (): INavLinkGroup[] => [{
        links: (orgId && projectId) ? [
            {
                key: 'overview',
                name: 'Overview',
                url: '',
                onClick: () => history.push(`/orgs/${orgId}/projects/${projectId}`),
            },
            {
                key: 'components',
                name: 'Components',
                url: '',
                onClick: () => history.push(`/orgs/${orgId}/projects/${projectId}/components`),
            },
            {
                key: 'members',
                name: 'Members',
                url: '',
                onClick: () => history.push(`/orgs/${orgId}/projects/${projectId}/members`),
            },
        ] : []
    }];

    const _onRenderLink = (link?: INavLink): JSX.Element => <Persona
        text={link?.name}
        size={PersonaSize.size24}
        coinProps={{ styles: { initials: { borderRadius: '4px' } } }} />

    return (
        <Stack
            verticalFill
            verticalAlign="space-between">
            {/* <Stack.Item styles={{ root: { padding: '10px 8px 10px 12px' } }}>
                <Persona
                    text='Project Name'
                    size={PersonaSize.size24}
                    styles={{ primaryText: { fontWeight: '600' } }}
                    coinProps={{ styles: { initials: { borderRadius: '4px' } } }} />
            </Stack.Item> */}
            <Stack.Item grow>
                <Nav
                    selectedKey={navId ?? 'overview'}
                    groups={_navLinkGroups()}
                    onRenderLink={_onRenderLink}
                    styles={{ root: [{ width: '100%' }], link: { padding: '8px 4px 8px 12px' } }} />
            </Stack.Item>
            <Stack.Item>
                <ActionButton
                    disabled={orgId === undefined || projectId === undefined}
                    iconProps={{ iconName: 'Settings' }}
                    styles={{ root: { padding: '10px 8px 10px 12px' } }}
                    text={'Project settings'}
                    onClick={() => history.push(`/orgs/${orgId}/projects/${projectId}/settings`)} />
            </Stack.Item>
        </Stack>
    );
}

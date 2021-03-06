// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ImplicitMSALAuthenticationProvider } from '@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider';
import { MSALAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions';

import { Client as GraphClient, GraphError, ResponseType } from '@microsoft/microsoft-graph-client'
import { auth } from './API'
import { GraphUser } from './model';

export enum PhotoSize {
    size48x48 = '48x48',
    size64x64 = '64x64',
    size96x96 = '96x96',
    size120x120 = '120x120',
    size240x240 = '240x240',
    size360x360 = '360x360',
    size432x432 = '432x432',
    size504x504 = '504x504',
    size648x648 = '648x648'
}

const graphScopes = ['User.Read', 'User.ReadBasic.All', 'Directory.Read.All', 'People.Read']; // An array of graph scopes

const options = new MSALAuthenticationProviderOptions(graphScopes);

const graphAuthProvider = new ImplicitMSALAuthenticationProvider(auth.authProvider, options);

const Client = GraphClient;
const client = Client.initWithMiddleware({ authProvider: graphAuthProvider });

const _userSelect = ['id', 'userPrincipalName', 'displayName', 'givenName', 'sirname', 'mail', 'companyName', 'jobTitle', 'preferredLanguage', 'userType', 'department']

export const getMe = async (): Promise<GraphUser> => {
    let response = await client
        .api('/me')
        .select(_userSelect)
        .get();
    let me = response as GraphUser;
    me.imageUrl = await getMePhoto();
    return me;
}

export const getGraphUser = async (id: string): Promise<GraphUser> => {
    try {
        let response = await client
            .api('/users/' + id)
            .select(_userSelect)
            // .header('X-PeopleQuery-QuerySources', 'Directory')
            .get();
        let user = response as GraphUser;
        user.imageUrl = await getUserPhoto(user.id);
        return user;
    } catch (error) {
        console.log(error as GraphError);
        throw error;
    }
}

export const getGraphUsers = async (): Promise<GraphUser[]> => {
    try {
        let response = await client
            .api('/users')
            .select(_userSelect)
            // .header('X-PeopleQuery-QuerySources', 'Directory')
            .get();
        let users: GraphUser[] = response.value;
        await Promise.all(users.map(async u => u.imageUrl = await getUserPhoto(u.id)));
        return users;
    } catch (error) {
        console.log(error as GraphError);
        throw error;
    }
}

export const searchGraphUsers = async (search: string): Promise<GraphUser[]> => {
    try {
        let response = await client
            .api('/users')
            .filter(`startswith(displayName,'${search}')`)
            .select(_userSelect)
            // .header('X-PeopleQuery-QuerySources', 'Directory')
            .get();
        let users: GraphUser[] = response.value;
        await Promise.all(users.map(async u => u.imageUrl = await getUserPhoto(u.id)));
        return users;
    } catch (error) {
        console.log(error as GraphError);
        throw error;
    }
}

export const getMePhoto = async (size: PhotoSize = PhotoSize.size240x240): Promise<string | undefined> => {
    try {
        let response = await client
            .api(`/me/photos/${size}/$value`)
            .header('Cache-Control', 'no-cache')
            .version('beta') // currently only work in beta: https://github.com/microsoftgraph/msgraph-sdk-dotnet/issues/568
            .responseType(ResponseType.BLOB)
            .get();
        return URL.createObjectURL(response);
    } catch (error) {
        if ((error as GraphError).statusCode === 404) return undefined;
        console.log(error as GraphError);
        throw error;
    }
}

export const getUserPhoto = async (id: string, size: PhotoSize = PhotoSize.size240x240): Promise<string | undefined> => {
    try {
        let response = await client
            .api(`/users/${id}/photos/${size}/$value`)
            .header('Cache-Control', 'no-cache')
            .version('beta') // currently only work in beta: https://github.com/microsoftgraph/msgraph-sdk-dotnet/issues/568
            .responseType(ResponseType.BLOB)
            .get();
        return URL.createObjectURL(response);
    } catch (error) {
        if ((error as GraphError).statusCode === 404) return undefined;
        console.log(error as GraphError);
        throw error;
    }
}

export const getGraphDirectoryObject = async (id: string): Promise<GraphUser> => {
    try {
        let response = await client
            .api('/directoryObjects/' + id)
            // .header('X-PeopleQuery-QuerySources', 'Directory')
            .get();
        return response as GraphUser;
    } catch (error) {
        console.log(error as GraphError);
        throw error;
    }
}

export const getGraphDirectoryObjects = async (): Promise<GraphUser[]> => {
    try {
        let response = await client
            .api('/directoryObjects')
            // .header('X-PeopleQuery-QuerySources', 'Directory')
            .get();
        return response.value as GraphUser[];
    } catch (error) {
        console.log(error as GraphError);
        throw error;
    }
}

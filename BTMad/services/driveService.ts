// Type definitions for Google API and Identity Services to fix compile errors
// In a real project, these would come from @types/gapi and @types/google.accounts
declare namespace google {
    namespace accounts {
        namespace oauth2 {
            interface TokenClient {
                callback: (resp: any) => void;
                requestAccessToken(options: { prompt: string }): void;
            }
            function initTokenClient(config: {
                client_id: string;
                scope: string;
                callback: (tokenResponse: any) => void;
            }): TokenClient;
            function revoke(token: string, callback: () => void): void;
        }
    }
}

declare namespace gapi {
    function load(apiName: string, callback: () => void): void;
    namespace client {
        function init(args: { apiKey: string; discoveryDocs: string[] }): Promise<void>;
        function getToken(): { access_token: string } | null;
        function setToken(token: { access_token: string } | null): void;
        function request(args: {
            path: string;
            method: string;
            params: any;
            headers: any;
            body: any;
        }): Promise<any>;

        const drive: {
            files: {
                list(args: {
                    q: string;
                    fields: string;
                    spaces: string;
                }): Promise<{ result: { files: { id: string; name: string }[] } }>;
                create(args: {
                    resource: any;
                    media: any;
                    fields: string;
                }): Promise<{ result: { id: string } }>;
                get(args: {
                    fileId: string;
                    alt: 'media';
                }): Promise<{ body: string }>;
            };
        };
    }
}


import { DataBundle } from '../types';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DATA_FILE_NAME = 'BTMad.data.json';

let tokenClient: google.accounts.oauth2.TokenClient;
let gapiInited = false;
let gsiInited = false;

let config = {
    apiKey: '',
    clientId: '',
};

export const configure = (newConfig: { apiKey: string, clientId: string }) => {
    config = newConfig;
};

// Funktion til at initialisere GAPI-klienten
const gapiInit = () => new Promise<void>((resolve, reject) => {
    if (!config.apiKey) return reject("API Key not configured");
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: config.apiKey,
            discoveryDocs: [DISCOVERY_DOC],
        }).then(() => {
            gapiInited = true;
            resolve();
        }).catch(reject);
    });
});

// Funktion til at initialisere GSI-klienten (Google Sign-In)
const gsiInit = () => new Promise<void>((resolve, reject) => {
    if (!config.clientId) return reject("Client ID not configured");
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: SCOPES,
        callback: () => {}, // Handled by the caller of requestToken
    });
    gsiInited = true;
    resolve();
});

// Initialiserer begge klienter og håndterer auth-status
export const initClient = async (callback: (isLoggedIn: boolean) => void) => {
    await Promise.all([gapiInit(), gsiInit()]);
    callback(gapi.client.getToken() !== null);
};


// Funktion til at anmode om et adgangstoken (starter login-flow)
export const requestToken = (onTokenReceived: () => void) => {
    const token = gapi.client.getToken();
    if (token !== null) {
        onTokenReceived();
        return;
    }
    
    tokenClient.callback = (resp) => {
      if (resp.error) {
        console.error("Token error:", resp);
        throw (resp);
      }
      onTokenReceived();
    };
    
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
};

export const signOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
        });
    }
};


// Finder datafilen eller opretter den, hvis den ikke findes
export const findOrCreateDataFile = async (): Promise<{ fileId: string; data: DataBundle | null }> => {
    // Søg efter filen
    const response = await gapi.client.drive.files.list({
        q: `name='${DATA_FILE_NAME}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.result.files && response.result.files.length > 0) {
        const fileId = response.result.files[0].id!;
        const fileContent = await readFile(fileId);
        return { fileId, data: fileContent };
    } else {
        // Opret filen, hvis den ikke findes
        const fileMetadata = {
            name: DATA_FILE_NAME,
            mimeType: 'application/json',
        };
        const initialContent: DataBundle = { recipes: [], users: [], categories: [] };
        const createResponse = await gapi.client.drive.files.create({
            resource: fileMetadata,
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(initialContent, null, 2),
            },
            fields: 'id',
        });
        return { fileId: createResponse.result.id!, data: initialContent };
    }
};

// Læser indholdet af en fil
const readFile = async (fileId: string): Promise<DataBundle | null> => {
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    try {
        return JSON.parse(response.body) as DataBundle;
    } catch (e) {
        console.error("Failed to parse data file:", e);
        return null;
    }
};

// Gemmer data til filen
export const saveData = async (fileId: string, data: DataBundle): Promise<void> => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const metadata = {
        name: DATA_FILE_NAME,
        mimeType: contentType
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        JSON.stringify(data, null, 2) +
        close_delim;

    await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
    });
};

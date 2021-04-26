import { TProvince } from "../../lib/icwb/province";

export const dummyProvinces: TProvince[] = [
    {
        id: '1000',
        name: 'BTN',
        state: {
            action: 'IDLE',
            canInvade: true,
            areaInvaded: false,
            areaClaimedBy: '1000',
            claimedProvincesId: ['1000'],
            neighbors: ['1001'],
            currentColor: '#FFF',
            mainColor: '#FFF',
            invasionCount: 0,
        }
    },
    {
        id: '1001',
        name: 'JB',
        state: {
            action: 'IDLE',
            canInvade: true,
            areaInvaded: false,
            areaClaimedBy: '1001',
            claimedProvincesId: ['1001'],
            neighbors: ['1000', '1002'],
            currentColor: '#F00',
            mainColor: '#F00',
            invasionCount: 0,
        }
    },
    {
        id: '1002',
        name: 'JTG',
        state: {
            action: 'IDLE',
            canInvade: true,
            areaInvaded: false,
            areaClaimedBy: '1002',
            claimedProvincesId: ['1002'],
            neighbors: ['1001'],
            currentColor: '#0F0',
            mainColor: '#0F0',
            invasionCount: 0,
        }
    }
];

export const orderedColorIds = ["5b49f824-4bff-4bb4-a344-3fa3c0706fe8","2bfba786-a388-4920-925b-4476bbdfdaa5","17365380-aece-4cda-9cb7-ea9f647cc899","23d7610a-3181-4a37-9c5b-5e656934da02","db4c3a5d-cee3-428f-a157-ce1ed45efbfd","bcb73fa3-750b-4aa0-833e-b55e154cbacc","7e414495-033a-4fdc-9a43-a3ece310ad4c","603bf7d6-5b6d-4f97-be38-fa9f6bbcd0be","84c3f972-ec26-4df6-a6a6-e7f04c7e8c2f","b90c0012-bffb-4c9f-96a1-8d1e81c55415","80000817-c0a5-4c8b-a538-e9f2b94eb872","90ed08f2-6f72-4306-aff2-860eb2545b1d","d4b8590c-1513-4d36-b727-b83c4bc6ddda","4b8ad506-0c17-4f33-baec-ced1068a0028","f188e073-200c-49dc-9112-9bd01192c856","149e928e-4346-4ade-b422-96f281a35bee","53734d63-d629-4810-8767-eab8bd71c248","c0b2fee0-c3b3-4ba5-a7f4-ba40ddcb9bbe","394edc3b-a931-4732-a25e-2ac364bf4608","fb93038e-df5e-40b0-acd8-b3396adf2ce2","647cc1bd-53e1-4f80-89a5-22eca77d987d","805e38f4-b630-4271-a0b0-39d14ef6888b","6fae3f87-800d-4b1a-961e-e0c3d7d7312f","2fb6057a-b399-4f7c-8bf4-b09fd971d2cd","fd83c866-5e44-444d-9beb-11cbe15bd63f","b81f9f49-e3e0-4acb-8514-72ec36cead4c","1ec48fe2-be85-4c07-865a-281cbece8fc4","37f1976e-0b44-46bd-b4f8-cd52e3607720","e53fdc00-2e11-43cf-88ec-1a5c2b9abf7b","2b887840-5122-4e7b-b526-5671d4c592e3","2763ea88-3287-421f-8cf2-8e6240db176a","fd0f22df-f983-4fdd-b708-25d0ff48c73e","f1ea94a5-d568-4790-a0f7-6804361b3b2d","15f30019-cedb-4497-8277-a8d44503a87d"];

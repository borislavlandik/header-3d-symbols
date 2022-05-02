export enum ICameraType {
    Prespective = 'perspective',
    Orthographic = 'ortigraphic'
}

interface ICameraSettingsRecord {
    [ICameraType.Prespective]: IPerspectiveCameraSettings,
    [ICameraType.Orthographic]: IOrthographicCameraSettings,
}

export interface ICameraSettings<T extends ICameraType = ICameraType> {
    type: T;
    settings: ICameraSettingsRecord[T];
}

export interface IPerspectiveCameraSettings {
    fov: number;
    aspect: number;
    near: number;
    far: number;
}

export interface IOrthographicCameraSettings {
    left: number;
    right: number; 
    top: number;
    bottom: number; 
    near: number;
    far: number;
}
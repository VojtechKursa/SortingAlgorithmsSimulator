import {PresetColor} from "./PresetColor";

export class ColorSet {
    private map: Map<PresetColor, string>;
    private defaultValue: string;

    public constructor(map: Map<PresetColor, string>, defaultValue: string) {
        this.map = map;
        this.defaultValue = defaultValue;
    }

    public get(color: PresetColor | undefined): string {
        if(color == undefined)
            return this.defaultValue;
        
        let result = this.map.get(color);

        if(result == undefined) {
            return this.defaultValue;
        }
        else {
            return result;
        }
    }
}

import {PresetColor} from "./PresetColor";

export class ColorSet {
    private map: Map<PresetColor, string>;
    private defaultValue: string;

    public constructor(map: Iterable<readonly [PresetColor, string]>, defaultValue: string) {
        this.map = new Map<PresetColor, string>();

        for (const item of map) {
            this.map.set(item[0], item[1]);
        }

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

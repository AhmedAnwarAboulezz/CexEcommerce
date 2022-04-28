export interface Table {
    title: string;
    rowPropertyName: string;
    type: string; // data, number, date, image, action
    actionType?: string; // icon
    actionIconName?: string[];
    className?: string;
    classNames?: string[];

}
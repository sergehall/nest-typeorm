export class DatabaseHasBeenClearedEvent {
  constructor(public arrTables: string[]) {}
}

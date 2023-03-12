declare global {
  interface WorkerMessageData<ActionType = string, DataType = Record<string, any>> {
    action: ActionType;
    data: DataType;
  }
}

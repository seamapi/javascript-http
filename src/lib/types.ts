export type SetNonNullable<
  BaseType,
  Keys extends keyof BaseType = keyof BaseType,
> = {
  [Key in keyof BaseType]: Key extends Keys
    ? NonNullable<BaseType[Key]>
    : BaseType[Key]
}

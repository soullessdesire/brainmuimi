export const queryKeys = {
  users:             ['users']                              as const,
  currentUser:       (id: string)   => ['currentUser', id] as const,
  documents:         ['documents']                          as const,
  documentById:      (id: string)   => ['documents', id]   as const,
  ratings:           (docId: string) => ['ratings', docId] as const,
  myRating:          (docId: string, uid: string) => ['ratings', docId, uid] as const,
}
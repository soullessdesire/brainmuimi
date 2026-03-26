export const queryKeys = {
  users:             ['users']                              as const,
  currentUser:       (id: string)   => ['currentUser', id] as const,
  documents:         ['documents']                          as const,
  documentById:      (id: string)   => ['documents', id]   as const,
  docRequests:       ['docRequests']                        as const,
  docRequestsByUser: (uid: string)  => ['docRequests', 'user', uid] as const,
}
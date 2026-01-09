import { urlAtom } from '@reatom/core';

export const navigate = (path: string) => urlAtom.go(path);
export { urlAtom };

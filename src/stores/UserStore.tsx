import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { signIn, signUp, logout as logoutRequest } from "../api/auth";
import { AJAXErrors } from "../api/errors";
import { getMe } from "../api/user";
import {
    Nofitication,
    getNofitications,
    getNofiticationsCount,
    setVisibleNofitication as setVisibleNofiticationRequest,
} from "../api/nofitications";

export interface UserStoreValue {
    login?: boolean;
    unread_count?: number;
    notifications?: Nofitication[];
    [key: string]: any;
}

interface UserStoreContextValue {
    value: UserStoreValue;
    me: () => Promise<AJAXErrors>;
    logout: () => Promise<void>;
    signin: (data: {
        email: string;
        password: string;
    }) => Promise<AJAXErrors>;
    signup: (data: {
        name: string;
        surname: string;
        email: string;
        password: string;
    }) => Promise<AJAXErrors>;
    getNofitications: () => Promise<void>;
    nextNofitications: () => Promise<void>;
    setVisibleNofitication: (id: string) => Promise<void>;
}

const UserStoreContext = createContext<UserStoreContextValue | null>(null);

export function UserStoreProvider({ children }: { children: ReactNode }) {
    const [value, setValue] = useState<UserStoreValue>({});
    const valueRef = useRef<UserStoreValue>(value);
    valueRef.current = value;

    const mergeValue = useCallback((patch: UserStoreValue) => {
        setValue((prev) => {
            const next = { ...prev, ...patch };
            valueRef.current = next;
            return next;
        });
    }, []);

    const me = useCallback(async () => {
        const res = await getMe();
        if (res.code === AJAXErrors.NoError) {
            mergeValue({ login: true, ...res.data });
        } else {
            mergeValue({ login: false });
        }
        return res.code;
    }, [mergeValue]);

    const logout = useCallback(async () => {
        await logoutRequest();
        mergeValue({ login: false });
    }, [mergeValue]);

    const signin = useCallback(
        async (data: { email: string; password: string }) => {
            const code = await signIn(data.email, data.password);
            if (code === AJAXErrors.NoError) {
                await me();
            }
            return code;
        },
        [me],
    );

    const signup = useCallback(
        async (data: {
            name: string;
            surname: string;
            email: string;
            password: string;
        }) => {
            const code = await signUp(
                data.name,
                data.surname,
                data.email,
                data.password,
            );
            if (code === AJAXErrors.NoError) {
                await me();
            }
            return code;
        },
        [me],
    );

    const fetchNofiticationsCount = useCallback(async () => {
        if (!valueRef.current.login) return;
        const { code, data } = await getNofiticationsCount();
        if (code === AJAXErrors.NoError) {
            mergeValue({ unread_count: data });
        }
    }, [mergeValue]);

    const fetchNofitications = useCallback(async () => {
        if (!valueRef.current.login) return;
        const { code, data } = await getNofitications();
        if (code === AJAXErrors.NoError) {
            mergeValue({
                unread_count: data.unread_count,
                notifications: data.nots,
            });
        }
    }, [mergeValue]);

    const nextNofitications = useCallback(async () => {
        if (!valueRef.current.login) return;
        const { code, data } = await getNofitications(
            valueRef.current.notifications?.length ?? 0,
        );
        if (code === AJAXErrors.NoError) {
            mergeValue({
                unread_count: data.unread_count,
                notifications: [
                    ...(valueRef.current.notifications ?? []),
                    ...data.nots,
                ],
            });
        }
    }, [mergeValue]);

    const setVisibleNofitication = useCallback(
        async (id: string) => {
            if (!valueRef.current.login) return;
            const code = await setVisibleNofiticationRequest(id);
            if (code === AJAXErrors.NoError) {
                mergeValue({
                    unread_count: (valueRef.current.unread_count ?? 0) - 1,
                    notifications: (valueRef.current.notifications ?? []).map(
                        (notification) =>
                            notification.id === id
                                ? { ...notification, isRead: true }
                                : notification,
                    ),
                });
            }
        },
        [mergeValue],
    );

    useEffect(() => {
        me().then(() => fetchNofiticationsCount());
        const timer = setInterval(fetchNofiticationsCount, 10000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UserStoreContext.Provider
            value={{
                value,
                me,
                logout,
                signin,
                signup,
                getNofitications: fetchNofitications,
                nextNofitications,
                setVisibleNofitication,
            }}
        >
            {children}
        </UserStoreContext.Provider>
    );
}

export function useUserStore(): UserStoreContextValue {
    const context = useContext(UserStoreContext);
    if (!context) {
        throw new Error("useUserStore must be used within UserStoreProvider");
    }
    return context;
}

import { createContext, useContext, useEffect, useState } from "react";
import { Account, Client, Models } from "react-native-appwrite";

// Initialize the Appwrite client
const client = new Client();

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // Your project ID

const account = new Account(client);

// Define the shape of our authentication context
type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<string | null>;
    isLoading: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('[Auth] Fetching current user...');
                const currentUser = await account.get();
                setUser(currentUser);
                console.log('[Auth] Current user loaded:', currentUser?.$id);
            } catch (error) {
                console.log('[Auth] No active session. Setting user to null.');
                setUser(null);
            } finally {
                setIsLoading(false);
                console.log('[Auth] Initial auth check complete.');
            }
        };
        fetchUser();
    }, []);

    const signIn = async (email: string, password: string): Promise<string | null> => {
        try {
            console.log('[Auth] Signing in...');
            await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
            console.log('[Auth] Sign-in successful. User:', currentUser.$id);
            return null;
        } catch (error) {
            console.error('[Auth] Sign-in error:', error);
            if (error instanceof Error) return error.message;
            return 'An unknown error occurred.';
        }
    };

    const signUp = async (email: string, password: string): Promise<string | null> => {
        try {
            console.log('[Auth] Signing up new user...');
            await account.create('unique()', email, password);
            const signInError = await signIn(email, password);
            return signInError;
        } catch (error) {
            console.error('[Auth] Sign-up error:', error);
            if (error instanceof Error) return error.message;
            return 'An unknown error occurred.';
        }
    };

    const signOut = async () => {
        try {
            console.log('[Auth] Signing out...');
            await account.deleteSession('current');
            setUser(null);
            console.log('[Auth] Sign-out successful. User set to null.');
        } catch (error) {
            console.error('[Auth] Error signing out:', error);
        }
    };

    const requestPasswordReset = async (email: string): Promise<string | null> => {
        try {
            if (!email) return 'Please enter your email first.';
            const redirectUrl = 'guppyai://password-reset';
            await account.createRecovery(email, redirectUrl);
            return null;
        } catch (error) {
            if (error instanceof Error) return error.message;
            return 'An unknown error occurred.';
        }
    };

    const authValue: AuthContextType = {
        user,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        isLoading,
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}

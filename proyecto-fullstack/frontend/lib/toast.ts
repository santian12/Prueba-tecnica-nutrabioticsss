// Safe toast wrapper for SSR compatibility
let toastInstance: any = null;

// Dynamically import toast only on client side
const getToast = async () => {
  if (typeof window === 'undefined') {
    // Return noop functions for server-side
    return {
      success: () => {},
      error: () => {},
      loading: () => {},
      dismiss: () => {},
    };
  }

  if (!toastInstance) {
    const { default: toast } = await import('react-hot-toast');
    toastInstance = toast;
  }
  
  return toastInstance;
};

// Safe toast functions that work in both SSR and client
export const toast = {
  success: async (message: string) => {
    const toastLib = await getToast();
    return toastLib.success(message);
  },
  error: async (message: string) => {
    const toastLib = await getToast();
    return toastLib.error(message);
  },
  loading: async (message: string) => {
    const toastLib = await getToast();
    return toastLib.loading(message);
  },
  dismiss: async (toastId?: string) => {
    const toastLib = await getToast();
    return toastLib.dismiss(toastId);
  },
};

// Synchronous versions that check for client-side
export const toastSync = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success(message);
      });
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(message);
      });
    }
  },
  loading: (message: string) => {
    if (typeof window !== 'undefined') {
      import('react-hot-toast').then(({ default: toast }) => {
        return toast.loading(message);
      });
    }
  },
  dismiss: (toastId?: string) => {
    if (typeof window !== 'undefined') {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.dismiss(toastId);
      });
    }
  },
};

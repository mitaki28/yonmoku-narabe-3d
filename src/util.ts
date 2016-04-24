export function LoggingOnReject(target, propertyKey, descriptor){
    let method = descriptor.value;
    descriptor.value = async function(...args) {
        try {
            return await method.apply(this, args);        
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.stack);
            } else {
                console.error(e);
            }
            throw e;
        }
    } 
    return descriptor;
};

export function sleep(t: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        window.setTimeout(() => {
            resolve();
        }, t);
    });
}

export function withTimeLimit<T>(promise: Promise<T>, limit: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let timer = setTimeout(() => reject(new Error('Execution timeout')), limit);
        promise.then(
            (data: T) => {
                clearTimeout(timer);
                resolve(data);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}
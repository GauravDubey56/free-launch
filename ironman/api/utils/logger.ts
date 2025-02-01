export const info = (...message: Array<any>): void => {
    console.info(...message)
}

export const error = (...message: Array<any>): void => {
    console.error(...message)
}


export const debug = (...message: Array<any>): void => {
    if(process.env.LOG_ENV == 'local') {
        console.info(...message)
    }
}
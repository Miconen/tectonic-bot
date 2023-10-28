interface IUserService {
    getPbs: (userId: string, guildId: string) => Promise<{time: string, boss: string}[]>
    getAccounts: (userId: string, guildId: string) => Promise<string[]>
}

export default IUserService

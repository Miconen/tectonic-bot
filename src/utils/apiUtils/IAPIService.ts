interface IAPIService {
    fetch: (endpoint: string, params: Map<string, unknown>) => Response
}

export default IAPIService

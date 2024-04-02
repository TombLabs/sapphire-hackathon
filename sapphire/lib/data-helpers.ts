import { SapphireUser } from "@/types";

const last30DaysThreshold = Date.now() - 1000 * 60 * 60 * 24 * 30; //one month
const last7DaysThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7; //one week

export function formatUserDataForGraph(userData: any[]) {

    const mappedDates = userData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map((user) => {
        const dayOfMonth = new Date(user.createdAt.getTIme()).getUTCDate();
        const month = new Date(user.createdAt.getTime()).getUTCMonth();
        const year = new Date(user.createdAt.getTime()).getUTCFullYear();
        return `${month}/${dayOfMonth}/${year}`
    })



    let userByDate: any = []

    for (let i = 0; i < mappedDates.length; i++) {
        const date = mappedDates[i];
        if (userByDate.length === 0) {
            userByDate.push({ date: date, count: 1 })
        }
        else if (userByDate.some((item: any) => item.date === date)) {
            userByDate.find((item: any) => item.date === date).count++
        } else {
            userByDate.push({ date: date, count: 1 })
        }
    }

    const generations = userData.map((user) => user.generations).flat()
    const generationWithMappedDates = generations.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map((generation) => {
        const dayOfMonth = new Date(generation.createdAt.getTime()).getUTCDate();
        const month = new Date(generation.createdAt.getTime()).getUTCMonth();
        const year = new Date(generation.createdAt.getTime()).getUTCFullYear();
        return { ...generation, date: `${month}/${dayOfMonth}/${year}` }
    })

    let generationsByDate: any = []

    for (let i = 0; i < generationWithMappedDates.length; i++) {
        const date = generationWithMappedDates[i].date;
        if (generationsByDate.length === 0) {
            generationsByDate.push({ date: date, count: 1 })
        }
        else if (generationsByDate.some((item: any) => item.date === date)) {
            generationsByDate.find((item: any) => item.date === date).count++
        } else {
            generationsByDate.push({ date: date, count: 1 })
        }
    }

    return { userByDate: userByDate, generationsByDate: generationsByDate }

}

export function formatMintDataForGraph(mintData: any) {

    const mappedDates = mintData.map((mint: any) => {
        const dayOfMonth = new Date(mint.createdAt.getTime()).getUTCDate();
        const month = new Date(mint.createdAt.getTime()).getUTCMonth();
        const year = new Date(mint.createdAt.getTime()).getUTCFullYear();
        return `${month}/${dayOfMonth}/${year}`
    })

    let mintsByDate: any = []

    for (let i = 0; i < mappedDates.length; i++) {
        const date = mappedDates[i];
        if (mintsByDate.length === 0) {
            mintsByDate.push({ date: date, count: 1 })
        }
        else if (mintsByDate.some((item: any) => item.date === date)) {
            mintsByDate.find((item: any) => item.date === date).count++
        } else {
            mintsByDate.push({ date: date, count: 1 })
        }
    }

    let mintsByType: any = []

    for (let i = 0; i < mintData.length; i++) {
        const type = mintData[i].type;
        if (mintsByType.length === 0) {
            mintsByType.push({ type: type, count: 1 })
        }
        else if (mintsByType.some((item: any) => item.type === type)) {
            mintsByType.find((item: any) => item.type === type).count++
        } else {
            mintsByType.push({ type: type, count: 1 })
        }
    }
    return {
        mintsByDate: mintsByDate, mintsByType: mintsByType.map((type: any) => {
            return {
                type: (type.type === "public cNFT" ? "Public" : type.type) + " - " + (type.count / mintsByType.reduce((a: any, b: any) => a + b.count, 0) * 100).toFixed(0) + "%",
                count: type.count
            }
        })
    }
}

export function determineSearchType(searchTerm: string) {
    let type: "package" | "user" | "transaction"
    const isBase58 = (searchTerm: string) => /^[A-HJ-NP-Za-km-z1-9]*$/.test(searchTerm);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const packageNames = ["shimmer", " radiance", "luminary", "celestial"]

    if (packageNames.includes(searchTerm.toLocaleLowerCase())) {
        type = "package"
    } else if (searchTerm.length === 64 && isBase58(searchTerm)) {
        type = "transaction"
    } else {
        type = "user"
    }
    return type

}
import DataLoader from 'dataloader'
import { Updoot } from '../entities/Updoot'

type TInput = {
  postId: number
  userId: number
}
type TOutput = Updoot | null

export const createUpdootLoader = () =>
  new DataLoader<TInput, TOutput>(async (keys) => {
    const updoots = await Updoot.findByIds(keys as any[])
    const updootIdsToUpdoot: Record<string, Updoot> = {}
    updoots.forEach((it) => {
      updootIdsToUpdoot[`${it.userId}|${it.postId}`] = it
    })

    return keys.map((it) => updootIdsToUpdoot[`${it.userId}|${it.postId}`])
  })

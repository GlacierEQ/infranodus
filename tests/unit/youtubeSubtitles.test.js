const fs = require('fs')
const path = require('path')

jest.mock('youtube-dl-exec', () => jest.fn())

const youtubeDlExec = require('youtube-dl-exec')
const { downloadSubtitles } = require('../../lib/utils/youtubeSubtitles')

async function cleanupDir(dir) {
    if (!dir) {
        return
    }

    try {
        await fs.promises.rm(dir, { recursive: true, force: true })
    } catch (err) {
        // Swallow errors as cleanup should not fail the tests
    }
}

describe('downloadSubtitles', () => {
    afterEach(async () => {
        jest.clearAllMocks()
    })

    it('downloads subtitles using youtube-dl-exec and returns file paths', async () => {
        youtubeDlExec.mockImplementation(async (url, options, execOptions) => {
            await fs.promises.writeFile(
                path.join(execOptions.cwd, 'sample.en.vtt'),
                'WEBVTT\n\n00:00.000 --> 00:02.000\nHello world'
            )
        })

        const files = await downloadSubtitles('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
            language: 'en',
            auto: false,
        })

        expect(youtubeDlExec).toHaveBeenCalledTimes(1)
        const options = youtubeDlExec.mock.calls[0][1]
        expect(options.skipDownload).toBe(true)
        expect(options.subLang).toBe('en')
        expect(options.writeAutoSub).toBe(false)
        expect(options.writeSub).toBe(true)
        expect(files.length).toBe(1)
        await cleanupDir(path.dirname(files[0]))
    })

    it('throws an error when youtube-dl-exec fails', async () => {
        youtubeDlExec.mockImplementation(() => Promise.reject(new Error('download failed')))

        await expect(downloadSubtitles('https://youtu.be/test')).rejects.toThrow('download failed')
        const execOptions = youtubeDlExec.mock.calls[0][2]
        await cleanupDir(execOptions && execOptions.cwd)
    })

    it('returns an empty array when no subtitles are produced', async () => {
        youtubeDlExec.mockImplementation(() => Promise.resolve())

        const files = await downloadSubtitles('https://youtu.be/empty', {
            language: 'fr',
            auto: true,
        })

        expect(files).toEqual([])
        const options = youtubeDlExec.mock.calls[0][1]
        expect(options.writeAutoSub).toBe(true)
        expect(options.writeSub).toBeUndefined()
        const execOptions = youtubeDlExec.mock.calls[0][2]
        await cleanupDir(execOptions && execOptions.cwd)
    })
})

const fs = require('fs').promises
const path = require('path')
const os = require('os')
const youtubeDlExec = require('youtube-dl-exec')

/**
 * Downloads subtitles for a YouTube video using youtube-dl-exec.
 * Returns an array of absolute paths to the downloaded subtitle files.
 *
 * @param {string} url - The YouTube video URL.
 * @param {Object} [options]
 * @param {string} [options.language='en'] - Subtitle language code.
 * @param {boolean} [options.auto=false] - Whether to download automatic subtitles.
 * @param {number} [options.timeout=60000] - Timeout in milliseconds for youtube-dl execution.
 * @returns {Promise<string[]>} Paths to downloaded subtitle files.
 */
async function downloadSubtitles(url, options = {}) {
    if (!url) {
        throw new Error('A YouTube URL must be provided to download subtitles.')
    }

    const { language = 'en', auto = false, timeout = 60000 } = options

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'infranodus-ytdl-'))

    const ytdlOptions = {
        skipDownload: true,
        subFormat: 'vtt',
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        writeAutoSub: auto,
        writeSub: !auto,
        subLang: language,
        output: path.join(tempDir, '%(title)s-%(id)s.%(ext)s'),
    }

    // youtube-dl fails if both writeSub and writeAutoSub are true
    if (auto) {
        delete ytdlOptions.writeSub
    }

    try {
        await youtubeDlExec(url, ytdlOptions, {
            cwd: tempDir,
            timeout,
        })
    } catch (error) {
        try {
            await fs.rm(tempDir, { recursive: true, force: true })
        } catch (cleanupError) {
            // ignore cleanup errors
        }
        throw error
    }

    const files = await fs.readdir(tempDir)
    const subtitleFiles = files
        .filter((file) => file.endsWith('.vtt') || file.endsWith('.srt'))
        .map((file) => path.join(tempDir, file))

    return subtitleFiles
}

module.exports = {
    downloadSubtitles,
}

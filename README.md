# File analyzer

## What's this tool?
This a simple file analyzer that use my code, jsdelivr, cdnjs.cloudflare, unpkg to analyze metadata, and take EXIF data
## File Info
- <kbd>Name</kbd>: The name of the file
- <kbd>Type</kbd>: Show what type of file (image, video, application,...)
- <kbd>Last Modified</kbd>: Show the last time edit the file/save the file
## What is EXIF Data
EXIF stands for Exchangeable Image File Format, is a standard for defining information related to an image, stored in JSON format.
## Tracks
### General
This track will show the general information about the file. Probably it is not all<br>
<kbd>FileName</kbd>: Show the file's name not include extension<br>
<kbd>FileExtension</kbd>: Show the file extension<br>
<kbd>FileSize</kbd>: Show the file size, in byte<br>
<kbd>Duration</kbd>: Show the file duration, in second (video only, idk why it here)<br>
<kbd>OverallBitRate</kbd>: Total of bitrate (bit/sec)<br>
<kbd>Format</kbd>: The whole name of file extension<br>
### Video
Video's information
<kbd>Format</kbd>: Type of video (AVC,...)<br>
<kbd>Width/Height</kbd>: Show the width/height in video (px)<br>
<kbd>FrameRate</kbd>: FPS<br>
<kbd>BitRate</kbd>: The amount of data transmitted over a period of time<br>
<kbd>CodecID</kbd>: Codec identification code<br>

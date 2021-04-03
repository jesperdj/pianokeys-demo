# Demo app for PianoKeys

This is a demo app for [PianoKeys](https://github.com/jesperdj/pianokeys).

## Using the demo app

Run `npm install` and then `npm run serve` to run the demo. A browser window will open.

Connect a MIDI keyboard and play. On the PianoKeys keyboard you'll see the pressed keys highlighted, and the note names and chord name (if a chord is recognized) are displayed.

Note that MIDI is not supported on all browsers. It should work on Chrome and Edge, but Firefox and Safari do currently not support MIDI. See https://caniuse.com/midi for browser support.

This app uses [tonal](https://github.com/tonaljs/tonal) to recognize chords.

Note: This demo app does not make any sound. It only displays the chords and notes that you play.

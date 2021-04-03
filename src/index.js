import style from './style.css';
import PianoKeys from '@jesperdj/pianokeys';
import { Note, Chord } from '@tonaljs/tonal';

const infoDiv = document.getElementById('info-container');
function setInfoText(text) {
    infoDiv.innerHTML = `<div>${text}</div>`;
}

const keyboard = new PianoKeys.Keyboard(document.getElementById('keyboard-container'));

const currentNotes = new Set();

if (navigator.requestMIDIAccess) {
    function onMIDIAccessSuccess(access, options) {
        access.onstatechange = onMIDIStateChange;

        // Set MIDI message listener on all connected inputs
        for (const input of access.inputs.values()) {
            if (input.state == 'connected') {
                input.onmidimessage = (message) => onMIDIMessage(input, message);
            }
        }

        setInfoText('Connect a MIDI keyboard and play!');
    }

    function onMIDIAccessFailure(error) {
        console.log(error);
        setInfoText('Failed to get access to MIDI.');
    }

    function onMIDIStateChange(event) {
        const port = event.port;
        if (port.type == 'input' && port.state == 'connected') {
            if (port.connection == 'closed') {
                port.open();
            } else if (port.connection == 'open') {
                port.onmidimessage = (message) => onMIDIMessage(port, message);
            }
        }
    }

    function onMIDIMessage(port, message) {
        // Ignore active sensing messages; these are connection keepalive messages that some devices send multiple times per second
        if (message.data[0] == 0xFE) return;

        const command = message.data[0];
        const note = Note.fromMidi(message.data[1]);
        const velocity = message.data.length > 2 ? message.data[2] : 0;

        let updateInfo = false;
        if (command == 0x90) {
            // Note on; some devices send note on with velocity 0 to turn a note off
            if (velocity > 0) {
                currentNotes.add(note);
                keyboard.fillKey(note);
            } else {
                currentNotes.delete(note);
                keyboard.clearKey(note);
            }
            updateInfo = true;
        } else if (command == 0x80) {
            // Note off
            currentNotes.delete(note);
            keyboard.clearKey(note);
            updateInfo = true;
        }

        if (updateInfo) {
            const notes = Note.sortedNames([...currentNotes]);
            const chord = Chord.detect(notes);

            const notesText = notes && notes.length > 0 ? notes.map(note => Note.pitchClass(note)).join(' ') : '';
            const chordText = chord && chord.length > 0 ? chord.join(' ') : '';
            setInfoText(`<span class="chord">${chordText}</span><span class="notes">${notesText}</span>`);
        }
    }

    navigator.requestMIDIAccess().then(onMIDIAccessSuccess, onMIDIAccessFailure);

} else {
    setInfoText('This browser does not support <a href="https://caniuse.com/midi">Web MIDI</a>.');
}

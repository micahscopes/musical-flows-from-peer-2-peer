# 🎶🌊 p2p musical flows experiment 🎶🌊
## what is it?
This is an experiment in sending musical data directly from browser to browser using the excellent p2p APIs available in [Agregore Browser](https://github.com/AgregoreWeb/agregore-browser)

I made this as a demo to show at the 2022 Wizard Amigos Code Camp... video coming soon!
## how does it work?
- data gets broadcast to peers by `POST`ing it via the `fetch` interface to a given `pubsub://` URL
- listening happens via an `EventSource` set up for the same URL
- events from the `EventSource` interface get turned into @most/core streams
- @most/core streams and stram transformations are used to glue the application together and modify/select/filter musical data in various ways
- [webmidi.js](https://webmidijs.org/docs/) is used to simplify WebMIDI setup
- the [all-around-keyboard](https://github.com/micahscopes/all-around-keyboard) web component is used for feedback and as a musical interface
​
## development notes
#### starting a development server at `http://localhost:4321`:
```
> npm install
> npm run dev
```

#### automatically building and publishing changes to hyperdrive
First ensure that you've set up the `hyp` CLI and have created a hyperdrive:
```
> hyp daemon start
> hyp create hyperdrive
```
This will give you a `hyper://` URL for the new hyperdrive. Modify the script in [package.json](./package.json#L17-L18) to use your new hyperdrive URL.

In one terminal start the build in watch mode:
```
> npm start build:watch
```
In another terminal start syncing in watch mode:
```
> npm start hyp:sync
```
Now whenever you make changes, `vite` will build to `./dist` and `hyp` will sync the changes to your hyperdrive.

---
![image](https://user-images.githubusercontent.com/389782/194609953-fcda02e6-59c4-4d8b-9a9e-c0393c7dbe09.png)
​
## notes and links
### misc links
- [@most/core](https://mostcore.readthedocs.io/en/latest/index.html)
- [awesome reactive programming](https://github.com/lucamezzalira/awesome-reactive-programming)
- I built a browser-based music/sfx/audio engine for the game [Wilderplace](https://wilderplace.place/):
  - uses [@most/core](https://mostcore.readthedocs.io/en/latest/index.html) in the [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) thread for time accurate, dynamic, reactive sequencing
  - synthesis is all done with the Yamaha DX7 emulator [webdx7](https://github.com/webaudiomodules/webdx7) ([web demo here!](https://www.webaudiomodules.org/wamsynths/webdx7/))
  - [there are tons of publicl domain, vintage DX7 presets on the world wide web](https://homepages.abdn.ac.uk/d.j.benson/pages/html/dx7.html#patches)
  - learn about the audio system from [a talk I shared at the 2022 Web Audio Conference](https://www.youtube.com/watch?v=jbkBsJD58gE)
  - and last but not least, find the game [on Steam](https://store.steampowered.com/app/1769640/Wilderplace/)!
​
### who are you and where can I find you?
- I'm Micah ([@micahscopes](https://github.com/micahscopes)), a creative and curious web hacker!
- Find me [on twitter](https://twitter.com/micahscopes)
- See me around on numerous Discord channels!
- Check out my website [wondering.xyz](https://wondering.xyz) 
- Learn about my creative hacking dreams and [support my work on GitHub Sponsors!](https://github.com/sponsors/micahscopes) 
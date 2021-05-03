'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';

export default class LinkFormatMessageDialog extends React.Component {

  componentWillMount () {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this dialog
    this.subscriptions.add(inkdrop.commands.add(document.body, {
      'link-format:toggle': () => this.toggle()
    }));

    //this.setState({ words: 0 });
  }

  componentWillUnmount () {
    this.subscriptions.dispose();
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog ref='dialog' title='LinkFormat'>
        LinkFormat was toggled!
      </MessageDialog>
    );
  }

  toggle() {
    /*
    console.log('WordCount was toggled!');
    const { dialog } = this.refs;
    if (!dialog.isShown) {
      const { editingNote } = inkdrop.store.getState();
      if(editingNote) {
        const { body } = editingNote;
        const words = body.split(/\s+/).length;
        this.setState({ words });
        dialog.showDialog();
      }
    } else {
      dialog.dismissDialog();
    }
     */

    const editor = inkdrop.getActiveEditor();
    const {cm} = editor;
    let text = cm.getSelection();
    if (text) {
      // selection text
      console.log("selected text");
      //console.log(text);

      const words = text.split(/\s+/);
      //console.log(words);

      for (let i = 0; i < words.length; i++) {
        const url = words[i];
        // https://, http://
        if (url.substr(0, 8) !== "https://" && url.substr(0, 7) !== "http://") {
          continue;
        }

        // download the webpage and grab <head><title> contents
        fetch(url).then(res=>res.text()).then(text => {
          console.log("paste-url fetching: "+url)
          var newdom = new DOMParser().parseFromString(text, 'text/html');
          const title = newdom.head.getElementsByTagName('title')[0].text;

          console.log(`[${title}](${url})`);

          // paste the URL with title into the Note
          //const editor = inkdrop.getActiveEditor();
          //const {cm} = editor;
          //cm.replaceSelection("["+title+"]("+url+")");
        })

        //console.log(word);
      }
    } else {
      /*
      console.log("all text");
      // all text
      const { editingNote } = inkdrop.store.getState();
      if (!editingNote) {
        return;
      }
      const { body } = editingNote;
      const words = body.split(/\s+/);
      console.log(words);
       */
    }
    //cm.replaceSelection("["+title+"]("+url+")");
  }
}

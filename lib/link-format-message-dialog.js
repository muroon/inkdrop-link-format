'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import { actions } from "inkdrop";
import { fetchAndReplaceText } from "./link-format-replace";

export default class LinkFormatMessageDialog extends React.Component {

  componentWillMount () {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this dialog
    this.subscriptions.add(inkdrop.commands.add(document.body, {
      'link-format:replace': () => this.replaceLinkFormat()
    }));
  }

  componentWillUnmount () {
    this.subscriptions.dispose();
  }

  render() {
    const MessageDialog = inkdrop.components.getComponentClass("MessageDialog");
    return (
      <MessageDialog ref='dialog' title='LinkFormat' buttons={[]} modalSettings={{ closable: false }}>
        <p className="link-format dialog">
          Fetching And Replacing!!
        </p>
      </MessageDialog>
    );
  }

  replaceLinkFormat() {
    const { dialog } = this.refs;
    if (dialog.isShown) {
      dialog.dismissDialog();
    }
    dialog.showDialog();

    (async function() {
      const editor = inkdrop.getActiveEditor();
      const {cm} = editor;
      let text = cm.getSelection();
      if (text) {
        // selected text
        text = await fetchAndReplaceText(text);
        cm.replaceSelection(text);
      } else {
        // all text
        const {editingNote} = inkdrop.store.getState();
        if (!editingNote) {
          return;
        }
        const {body} = editingNote;
        text = await fetchAndReplaceText(body.toString());
        inkdrop.store.dispatch(actions.editingNote.update({ body: text }));
      }

      dialog.dismissDialog();
    })();
  }
}


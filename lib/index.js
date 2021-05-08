"use babel";

import LinkFormatMessageDialog from "./link-format-message-dialog";

module.exports = {
  activate() {
    inkdrop.components.registerClass(LinkFormatMessageDialog);
    inkdrop.layouts.addComponentToLayout("modal", "LinkFormatMessageDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      "modal",
      "LinkFormatMessageDialog"
    );
    inkdrop.components.deleteClass(LinkFormatMessageDialog);
  },
};

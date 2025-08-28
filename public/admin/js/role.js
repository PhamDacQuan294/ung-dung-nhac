// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonsDelete.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xoá topic này không?");

      if(isConfirm) {
        const id = button.getAttribute("data-id");
        
        const action = `${path}/${id}`;

        formDeleteItem.action = action;

        const redirectUrl = window.location.pathname + window.location.search;
        formDeleteItem.action += `?_method=DELETE&redirect=${encodeURIComponent(redirectUrl)}`;

        formDeleteItem.submit();
      }
    });
  }); 
}
// End Delete Item
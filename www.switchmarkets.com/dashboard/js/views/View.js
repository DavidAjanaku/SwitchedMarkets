
export default class View{
  _data;
  render(data){
    if(!data ||( Array.isArray(data) && data.length === 0)) 
      return new Error("data to render is invalid");

      this._data = data;
      this._parentEl.innerHTML = null;
      const markUp = this._generateMarkup();
      this._parentEl.insertAdjacentHTML('afterbegin',markUp);
  }
}
let ref;

for (let i = 0; i < 9999; i++) {
  const myFunction = () => {
    ref = i;
  };
  ref = setTimeout(myFunction, 99999999);
}

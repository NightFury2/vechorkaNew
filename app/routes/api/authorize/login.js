export default function login(req) {
  const user = {
    name: req.body.name
  };
  return Promise.resolve(user);
}

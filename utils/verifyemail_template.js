module.exports.EmailVerificationTemplate = (link, name) => {
  return `
    <!DOCTYPE html>
  <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- CSS only -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous">
    <title>Email Verification</title>
      <style>
        body{
          background-color: #84bcda4f;
        }
      </style>
    </head>
    <body>
      <h4 class="text-center mt-5">Notelify</h4>
      <div class="w-75 p-4 m-auto my-5 bg-light">
        <p class="fw-bold" style="text-transform: capitalize;>Hello, ${name}</p>
        <p>Please click the button below to verify your email address.</p>
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          "
        >
          <a href="${link}" style="
            background-color: rgba(26, 24, 24, 0.877);
            display: inline-block;
            padding: 0.5rem 1rem;
            text-decoration: none;
            color: white;
          ">Verify Email Address</a>
        </div>
        <p>If you did not create an account, no further action is required.</p>
        <div><p class="mb-0">Regards,</p> <p class="mt-0">Notelify.</p></div>
        <hr class="my-4">
        <div>
          <p class="small">If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser: <a href="${link}">${link}</a></p>
        </div>
      </div>
    </body>
  </html>
  `
}

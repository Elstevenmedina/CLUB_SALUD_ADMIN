const email = {}

email.sendEmail = (footer, btnTexto, btnUrl, content, titulo) => {
    let contentHtml = `
<div id=":aa" class="a3s aiL msg-8952267020206781817">
    <u></u>
  <div
    style="background-color:#f6f7f7;font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,
    Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:15px;color:#101517;line-height:1.7;margin:0;padding:0"
  >
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="m_-8952267020206781817body"
      style="border-collapse:collapse;background-color:#f6f7f7;width:100%"
    ><tbody><tr><td
            class="m_-8952267020206781817container"
            style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,
            Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;display:block;max-width:680px;width:100%;margin:0 auto"
          >
            <div
              class="m_-8952267020206781817content"
              style="box-sizing:border-box;display:block;margin:0 40px;padding:40px 0px 24px"
            >
              <table
                role="presentation"
                class="m_-8952267020206781817main"
                style="border-collapse:collapse;background:#fff;width:100%;border-radius:2px"
              ><tbody><tr><td
                      class="m_-8952267020206781817wrapper"
                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,
                      Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;box-sizing:border-box;padding:40px 56px"
                    >
                      <table
                        role="presentation"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        style="border-collapse:collapse;width:100%"
                      ><tbody><tr><td
                              style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,
                              Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px"
                            >
                              <table
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                class="m_-8952267020206781817header"
                                style="border-collapse:collapse;width:100%;margin-bottom:48px;line-height:24px"
                              ><tbody><tr><td
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,
                                      Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;vertical-align:middle;min-width:88px;width:30%"
                                    >
                                      <img
                                        src="https://app.clubsaludve.com//images/business/logo.png"
                                        alt="Club Salud Logo"
                                        style="border:none;max-width:100%;width:120px;height:75px;display:block"
                                        class="CToWUd"
                                      /></td>
                                    <td
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,
                                      Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;text-align:right;font-size:14px;vertical-align:center"
                                    >

                                    <a
                                    href="https://clubsaludve.com/"
                                    style="text-decoration:none;font-weight:700;"
                                    target="_blank"
                                    data-saferedirecturl="https://www.google.com/url?q=https://clubsaludve.com/blog&amp;source=gmail&amp;ust=1653935649732000&amp;usg=AOvVaw06BRm0qmW_mx2ElWxn_Sx_"
                                  >
                                  <span style="color: rgba(0,203,51,1);">www.clubs</span><span style="color: rgba(38,87,237,1);">aludve.com</span></a>
                                    </td>
                                  </tr></tbody></table><h1
                                class="m_-8952267020206781817post-name"
                                style="color:#2d3338;line-height:1.15;margin-bottom:30px;font-size:35px;font-weight:900;margin:0 0 50px"
                              >
                                <p
                                  style="color:#000;text-decoration:none; "
                                  target="_blank"
                                >${titulo}</p>
                              </h1>
                              <table
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="border-collapse:collapse;width:100%"
                              ><tbody><tr><td
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px"
                                    >
									<div style="margin-bottom:24px" >
                                        ${content}
                                        <div
                                          style="margin-bottom:24px;clear:both"
                                        ></div>
                                      </div>
                                    </td>
                                  </tr></tbody></table><table
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="border-collapse:collapse;margin:24px 0 0;width:100%"
                              ><tbody><tr
                                    class="m_-8952267020206781817btn-bar-wrapper"
                                  ><td
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;width:1%"
                                    >

                                      <table
                                        role="presentation"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        class="m_-8952267020206781817btn m_-8952267020206781817btn-wrapper m_-8952267020206781817btn-primary"
                                        style="border-collapse:collapse;box-sizing:border-box;width:auto;float:left;text-align:center"
                                      ><tbody><tr><td
                                              align="left"
                                              style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px"
                                            >
                                              <table
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                class="m_-8952267020206781817btn-anchor-wrapper"
                                                style="border-collapse:collapse;width:auto;margin-right:16px;border-radius:100px"
                                              ><tbody><tr><td
                                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px;background-color:#ffffff;text-align:center;border-radius:100px"
                                                    >
                                                      <a
                                                        href="${btnUrl}"
                                                        style="border:solid 1px transparent;
                                                        box-sizing:border-box;display:inline-block;
                                                        font-size:16px;font-weight:400;line-height:1;
                                                        margin:0;white-space:nowrap;border-radius:4px;
                                                        text-decoration:none;color:#fff;padding:13px 24px;
                                                        background:linear-gradient(90deg, rgba(0,203,51,1) 30%, rgba(38,87,237,1) 73%);"
                                                        target="_blank"
                                                        data-saferedirecturl="https://www.google.com/url?q=${btnUrl}%23respond&amp;source=gmail&amp;ust=1653935649733000&amp;usg=AOvVaw3YadWa27_zlQoFO5WOSZTW"
                                                      >${btnTexto}</a>
                                                      </td>
                                                  </tr>
                                                  </tbody></table></td>
                                          </tr></tbody></table></td>
                                    <td
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px"
                                    >
                                    </td>
                                  </tr></tbody></table><table
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="border-collapse:collapse;width:100%"
                              ><tbody><tr></tr><tr><td
                                      colspan="2"
                                      style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-size:16px"
                                    >
                                      <hr
                                        style="border:0;border-bottom:1px solid #eaeaea;margin:15px 0;margin-top:24px;border-width:0;background:#dcdcde;color:#dcdcde;height:1px;width:80px"
                                      /><div
                                        style="margin:0 0 24px 0;color:#646970;font-size:16px"
                                      >
                                        <p
                                          style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-weight:400;line-height:1.7;padding:0;margin:0;color:#646970;font-size:16px"
                                        >
										${footer}
                                        </p>
                                      </div>
                                      <div
                                        style="margin:0 0 24px 0;color:#646970;font-size:16px"
                                      >
                                        <p
                                          style="font-family:-apple-system,system-ui,blinkmacsystemfont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif;font-weight:400;line-height:1.7;padding:0;margin:0;color:#646970;font-size:16px"
                                        >
                                        Ha recibido este correo electronico porque registró una cuenta en Club Salud VE &copy;.
                                        </p>
                                      </div>
                                    </td>
                                  </tr></tbody></table><table
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="border-collapse:collapse;width:100%"
                              ></table></td>
                          </tr></tbody></table></td>
                  </tr></tbody></table></div>
 
          </td>
        </tr></tbody></table></div><div class="yj6qo"></div><div class="adL">

    </div>
</div>    
    `
    return contentHtml
}


module.exports = email
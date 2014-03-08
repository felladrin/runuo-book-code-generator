$('#title').popover({'trigger': 'focus', 'placement': 'right', 'content': 'Max: 25 Characters'});
$('#author').popover({'trigger': 'focus', 'placement': 'right', 'content': 'Max: 25 Characters'});
$('#file').popover({'trigger': 'focus', 'placement': 'right', 'content': 'Max: 30 Characters'});
$('#cover').popover({'trigger': 'focus', 'placement': 'right', 'title': 'Cover Hue', 'content': 'From 0 to 1000. Choosing 0 will make the book cover appear in its original color, like the image above.'});
$('#format').popover({'trigger': 'focus', 'placement': 'right', 'title': 'The AutoFormat Feature', 'content': 'The AutoFormat makes the following changes on the book content: Replaces all breaklines by a space; Makes a recursive scan to remove multiple spaces; Removes breaklines and spaces at the start.'});
$('#itemid').ImageSelect({'width': '100%', 'height': '46', 'lock': 'width'});

/**
 * Collects the data and generates the code.
 */
function genCode()
{
    var bookTitle = document.form.title.value;
    var bookAuthor = document.form.author.value;
    var coverHue = document.form.cover.value;
    var fileName = document.form.file.value;
    var content = document.form.text.value;
    var itemid = document.form.itemid.value;

    content = content.replace(/"/g, "'");     //replaces all double quotes by single quotes to avoid errors on the generated code.
    content = content.replace(/\\/g, "\\\\"); //duplicates all backslashes to avoid errors on the generated code.
    content = content.replace(/\s*$/gi, "");  //removes breaklines and spaces at the end.

    if (document.form.format.value === "yes")
    {
        content = content.replace(/\n/g, ' ');       //replaces all breaklines by a space.
        content = content.replace(/[ ]{2,}/gi, " "); //makes a recursive scan to remove multiple spaces.
        content = content.replace(/^\s*/gi, "");     //removes breaklines and spaces at the start.
    }

    content = splitText(content, 25); //splits the book content in 25 characters per line and 8 lines per page.

    var header = 'using System;\nusing Server;\n\nnamespace Server.Items\n{\n\tpublic class ' + fileName + ' : BaseBook\n\t{\n\t\tpublic static readonly BookContent Content = new BookContent\n\t\t(\n\t\t\t"' + bookTitle + '", "' + bookAuthor + '",\n\n\t\t\tnew BookPageInfo\n\t\t\t(\n\t\t\t\t"';
    var footer = '"\n\t\t\t)\n\t\t);\n\n\t\tpublic override BookContent DefaultContent{ get{ return Content; } }\n\n\t\t[Constructable]\n\t\tpublic ' + fileName + '() : base( ' + itemid + ', false )\n\t\t{\n\t\t\tHue = ' + coverHue + ';\n\t\t}\n\n\t\tpublic ' + fileName + '( Serial serial ) : base( serial )\n\t\t{\n\t\t}\n\n\t\tpublic override void Serialize( GenericWriter writer )\n\t\t{\n\t\t\tbase.Serialize( writer );\n\t\t\twriter.WriteEncodedInt( (int)0 );\n\t\t}\n\n\t\tpublic override void Deserialize( GenericReader reader )\n\t\t{\n\t\t\tbase.Deserialize( reader );\n\t\t\tint version = reader.ReadEncodedInt();\n\t\t}\n\t}\n}';

    document.form.thecode.value = header + content + footer;
}

/**
 * Makes the dirty job, analysing the text and setting it to runuo code format.
 * @param {String} rest
 * @param {String} characters
 * @returns {String}
 */
function splitText(rest, characters)
{
    var splited = '';
    var lineCount = 1;

    while (rest.length > characters || rest.indexOf('\n') !== -1)
    {
        var line = rest.substring(0, characters);
        var lineEnd = characters;

        if (line.indexOf('\n') !== -1)
        {
            lineEnd = line.indexOf('\n');
        }
        else if (line.lastIndexOf(' ') !== -1)
        {
            lineEnd = line.lastIndexOf(' ');
        }

        if ((lineCount % 8) === 0)
        {
            splited += line.substring(0, lineEnd) + '"\n\t\t\t),\n\t\t\tnew BookPageInfo\n\t\t\t(\n\t\t\t\t"';
            lineCount++;
        }
        else
        {
            splited += line.substring(0, lineEnd) + '",\n\t\t\t\t"';
            lineCount++;
        }

        if (line.indexOf('\n') !== -1 || line.lastIndexOf(' ') !== -1)
        {
            rest = rest.substring(lineEnd + 1);
        }
        else
        {
            rest = rest.substring(lineEnd);
        }
    }

    return splited + rest;
}

/**
 * Generates the code, hide the edition, and show the result block.
 */
function showCode()
{
    if (checkFileName(document.form.file.value) && checkLimit(document.form.text.value)) //only proceeds if the file name and character limit are ok.
    {
        genCode();
        document.getElementById('edition').style.display = 'none';
        document.getElementById('result').style.display = 'block';
    }
}

/**
 * Hides the result, and show the edition block.
 */
function backToEdition()
{
    document.getElementById('result').style.display = 'none';
    document.getElementById('edition').style.display = 'block';
}

/**
 * Removes all tabs, braklines and useless blank spaces from the book's content.
 * @param {String} code
 */
function compress(code)
{
    code = code.replace(/\n/g, ' ').replace(/\t/g, ' ');
    while (code.indexOf('  ') >= 0)
        code = code.replace(/  /g, ' ');
    document.form.thecode.value = code;
}

/**
 * Checks if the file name has special characters or accents.
 * @param {String} name
 * @returns {Boolean}
 */
function checkFileName(name)
{
    var sChars = "%^!&*()+=-:<>[]\\\';@#$,./{}|\"?~_";

    for (var i = 0; i < name.length; i++)
    {
        if (name.charCodeAt(i) > 127 || sChars.indexOf(name.charAt(i)) >= 0)
        {
            alert("The file name has some special characters.\nPlease remove them before continuing.");
            return false;
        }
    }

    return true;
}

/**
 * Checks if the book content has reached the character limit (60,000).
 * @param {String} content
 * @returns {Boolean}
 */
function checkLimit(content)
{
    var charCount = content.length;

    if (charCount > 60000)
    {
        var cutText = confirm("The book content has " + charCount + " characters. The limit is 60000.\nPress OK to cut the text or Cancel to leave it intact.");

        if (cutText)
            document.form.text.value = content.substring(0, 60000);

        return false;
    }

    return true;
}
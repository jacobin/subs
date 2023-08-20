import sys

from requests import PreparedRequest, Request


def main() -> None:
    urls: list[str] = list(map(str.strip, sys.stdin.readlines()))
    request: Request = Request(
        method="GET", url="https://subs.liblaf.me/api/clash", params={"subs": urls}
    )
    prepared: PreparedRequest = request.prepare()
    print(prepared.url)


if __name__ == "__main__":
    main()
